"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardProvider } from "@/features/dashboard/context/dashboard-context";
import type { PropsWithChildren } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";

export function DashboardNavigation({ children }: PropsWithChildren) {
  return (
    <DashboardProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset className="border-border border">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger
              variant="outline"
              className="size-8 cursor-pointer"
            />
            <h1 className="text-lg font-semibold">AG1 Analytics Dashboard</h1>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProvider>
  );
}
