"use client";

import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import { Skeleton } from "@/components/ui/skeleton";
import { CreasTable } from "../_components/creas-table";
import { DashboardFilters } from "../_components/dashboard-filters";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[600px] w-full" />
    </div>
  );
}

export default function CreasPage() {
  const { isLoading, error, filteredAds } = useDashboard();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tableau des Créas</h2>
        <span className="text-muted-foreground text-sm">
          {filteredAds.length} créa{filteredAds.length > 1 ? "s" : ""}
        </span>
      </div>

      <DashboardFilters showSearch showCreator showContentType />

      <CreasTable />
    </div>
  );
}
