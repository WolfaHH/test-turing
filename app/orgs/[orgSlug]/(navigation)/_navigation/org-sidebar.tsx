"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarNavigationMenu } from "@/components/ui/sidebar-utils";
import { ChangelogDebugActions } from "@/features/changelog/changelog-debug-actions";
import type { Changelog } from "@/features/changelog/changelog-manager";
import { ChangelogSidebarStack } from "@/features/changelog/changelog-sidebar-stack";
import type { NavigationGroup } from "@/features/navigation/navigation.type";
import { SidebarUserButton } from "@/features/sidebar/sidebar-user-button";
import type { AuthRole } from "@/lib/auth/auth-permissions";
import type { AuthOrganization } from "@/lib/auth/auth-type";
import { ArrowLeft, Settings } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { getOrganizationNavigation } from "./org-navigation.links";

import { OrgsSelect } from "./orgs-select";
import { UpgradeCard } from "./upgrade-org-card";
import { LogoSvg } from "@/components/svg/logo-svg";

const OrgCommand = dynamic(
  async () => import("./org-command").then((mod) => mod.OrgCommand),
  { ssr: false },
);

export function OrgSidebar({
  slug,
  userOrgs,
  roles,
  changelogs,
}: {
  slug: string;
  roles: AuthRole[] | undefined;
  userOrgs: AuthOrganization[];
  changelogs: Changelog[];
}) {
  const pathname = usePathname();
  const allLinks: NavigationGroup[] = getOrganizationNavigation(slug, roles);

  const isSettingsPage = pathname.includes("/settings");

  const links = useMemo(() => {
    if (isSettingsPage) {
      return allLinks.filter((group) => group.title === "Organization");
    }
    return allLinks.filter((group) => group.title !== "Organization");
  }, [allLinks, isSettingsPage]);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="flex flex-col gap-2">
        {isSettingsPage ? (
          <Button variant="ghost" className="justify-start" asChild>
            <Link href={`/orgs/${slug}`} prefetch={false}>
              <ArrowLeft className="size-4" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <LogoSvg size={28} className="shrink-0" />
              <span className="font-semibold group-data-[collapsible=icon]:hidden">
                Cod'Hash
              </span>
            </div>
            <OrgsSelect orgs={userOrgs} currentOrgSlug={slug} />
            <OrgCommand />
          </>
        )}
      </SidebarHeader>
      <SidebarContent className="border-card">
        {links.map((link) => (
          <SidebarGroup key={link.title}>
            <SidebarGroupLabel>{link.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarNavigationMenu link={link} />
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-2">
        {!isSettingsPage && (
          <>
            <div className="group-data-[collapsible=icon]:hidden">
              {changelogs.length > 0 && (
                <ChangelogSidebarStack changelogs={changelogs} />
              )}
              <ChangelogDebugActions />
              <UpgradeCard />
            </div>
            <Button
              variant="outline"
              asChild
              size="sm"
              className="w-full group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0"
            >
              <Link href={`/orgs/${slug}/settings`} prefetch={false}>
                <Settings className="size-4" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Settings
                </span>
              </Link>
            </Button>
          </>
        )}
        <SidebarUserButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
