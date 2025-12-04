import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { auth } from "../auth";
import type { AuthPermission, AuthRole } from "../auth/auth-permissions";
import { getPlanLimits } from "../auth/stripe/auth-plans";
import { getSession } from "../auth/auth-user";
import { logger } from "../logger";
import { prisma } from "../prisma";
import { getOrgActiveSubscription } from "./get-org-subscription";
import { isInRoles } from "./is-in-roles";

type OrgParams = {
  roles?: AuthRole[];
  permissions?: AuthPermission;
  currentOrgId?: string;
  currentOrgSlug?: string;
};

const getFullOrg = async (orgId: string, userId: string) => {
  return prisma.organization.findUnique({
    where: {
      id: orgId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      metadata: true,
      createdAt: true,
      stripeCustomerId: true,
      members: {
        where: {
          OR: [{ userId: userId }, { role: "owner" }],
        },
        select: {
          createdAt: true,
          id: true,
          role: true,
          updatedAt: true,
          userId: true,
          user: {
            select: {
              email: true,
              name: true,
              id: true,
            },
          },
        },
        take: 2,
      },
    },
  });
};

const getOrg = async (params?: OrgParams) => {
  const user = await getSession();

  if (user?.session.activeOrganizationId) {
    return getFullOrg(user.session.activeOrganizationId, user.session.userId);
  }

  if (params?.currentOrgId) {
    try {
      await auth.api.setActiveOrganization({
        headers: await headers(),
        body: {
          organizationId: params.currentOrgId,
        },
      });

      const updatedUser = await getSession();

      if (updatedUser?.session.activeOrganizationId) {
        return getFullOrg(
          updatedUser.session.activeOrganizationId,
          updatedUser.session.userId,
        );
      }
    } catch (err) {
      logger.error("Error setting active organization", err);
    }
  }

  if (params?.currentOrgSlug) {
    try {
      await auth.api.setActiveOrganization({
        headers: await headers(),
        body: {
          organizationSlug: params.currentOrgSlug,
        },
      });

      const updatedUser = await getSession();
      if (updatedUser?.session.activeOrganizationId) {
        return getFullOrg(
          updatedUser.session.activeOrganizationId,
          updatedUser.session.userId,
        );
      }
    } catch (err) {
      logger.error("Error setting active organization", err);
    }
  }

  const firstOrg = await prisma.organization.findFirst({
    where: {
      members: {
        some: { userId: user?.session.userId },
      },
    },
  });

  if (firstOrg) {
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: { organizationId: firstOrg.id },
    });

    const updatedUser = await getSession();
    if (updatedUser?.session.activeOrganizationId) {
      return getFullOrg(
        updatedUser.session.activeOrganizationId,
        updatedUser.session.userId,
      );
    }
  }

  return null;
};

export const getCurrentOrg = async (params?: OrgParams) => {
  const user = await getSession();

  if (!user) {
    return null;
  }

  const org = await getOrg(params);

  if (!org) {
    return null;
  }

  const memberRoles = org.members
    .filter((member) => member.userId === user.session.userId)
    .map((member) => member.role);

  if (
    memberRoles.length === 0 ||
    !isInRoles(memberRoles as AuthRole[], params?.roles)
  ) {
    return null;
  }

  if (params?.permissions) {
    const hasPermission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permission: params.permissions,
      },
    });

    if (!hasPermission.success) {
      return null;
    }
  }

  const [currentSubscription, owner] = await Promise.all([
    getOrgActiveSubscription(org.id),
    org.members.find((member) => member.role === "owner")
      ? Promise.resolve(org.members.find((member) => member.role === "owner"))
      : prisma.member.findFirst({
          where: {
            organizationId: org.id,
            role: "owner",
          },
          select: {
            role: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        }),
  ]);

  const limits = currentSubscription?.limits ?? getPlanLimits();

  return {
    ...org,
    slug: org.slug ?? "",
    user: user.user,
    email: (owner?.user.email ?? null) as string | null,
    memberRoles: memberRoles as AuthRole[],
    subscription: currentSubscription ?? null,
    limits,
  };
};

export type CurrentOrgPayload = NonNullable<
  Awaited<ReturnType<typeof getCurrentOrg>>
>;

export const getRequiredCurrentOrg = async (params?: OrgParams) => {
  const result = await getCurrentOrg(params);

  if (!result) {
    unauthorized();
  }

  return result;
};
