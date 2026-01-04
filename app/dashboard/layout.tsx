import type { PropsWithChildren } from "react";
import { DashboardNavigation } from "./_components/dashboard-navigation";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return <DashboardNavigation>{children}</DashboardNavigation>;
}
