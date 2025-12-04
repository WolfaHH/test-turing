"use client";

import type { OverrideLimits, PlanLimit } from "@/lib/auth/stripe/auth-plans";
import { getPlanLimits } from "@/lib/auth/stripe/auth-plans";
import type { CurrentOrgPayload } from "@/lib/organizations/get-org";
import type React from "react";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { create } from "zustand";

type CurrentOrgStore = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  subscription: CurrentOrgPayload["subscription"] | null;
  limits: PlanLimit;
};

/**
 * Get the current org id in **client component**
 *
 * Usage :
 *
 * ```tsx
 * "use client";
 *
 * export const ClientComponent = () => {
 *   const currentOrg = useCurrentOrg();
 *
 *   return (
 *     <div>
 *       <p>Current org id : {currentOrg.id}</p>
 *     </div>
 *   )
 * }
 */
export const useCurrentOrg = create<CurrentOrgStore | null>(() => null);

export const InjectCurrentOrgStore = (
  props: PropsWithChildren<{
    org?: Omit<CurrentOrgStore, "limits">;
  }>,
): React.ReactNode => {
  const org = props.org;

  useEffect(() => {
    if (!org) return;
    if (useCurrentOrg.getState()) return;

    useCurrentOrg.setState({
      id: org.id,
      slug: org.slug,
      name: org.name,
      image: org.image,
      subscription: org.subscription,
      limits: getPlanLimits(
        org.subscription?.plan,
        org.subscription?.overrideLimits
          ? (org.subscription.overrideLimits as unknown as OverrideLimits)
          : null,
      ),
    });
  }, [org]);

  return props.children;
};
