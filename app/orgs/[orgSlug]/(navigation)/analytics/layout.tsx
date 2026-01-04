"use client";

import type { PropsWithChildren } from "react";
import { DashboardProvider } from "@/features/dashboard/context/dashboard-context";

export default function AnalyticsLayout({ children }: PropsWithChildren) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
