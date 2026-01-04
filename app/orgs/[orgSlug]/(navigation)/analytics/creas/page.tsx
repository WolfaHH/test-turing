"use client";

import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import { Skeleton } from "@/components/ui/skeleton";
import { CreasTable } from "../_components/creas-table";
import { DashboardFilters } from "../_components/dashboard-filters";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-full max-w-3xl" />
      <Skeleton className="h-[500px] w-full" />
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
        <h1 className="text-xl font-semibold">Tableau des Créas</h1>
        <span className="text-muted-foreground text-sm">
          {filteredAds.length} résultat{filteredAds.length > 1 ? "s" : ""}
        </span>
      </div>

      <DashboardFilters showSearch showCreator showContentType />

      <CreasTable />
    </div>
  );
}
