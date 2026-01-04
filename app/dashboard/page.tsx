"use client";

import {
  DollarSign,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { BudgetChart } from "./_components/budget-chart";
import { DashboardFilters } from "./_components/dashboard-filters";
import { KPICard } from "./_components/kpi-card";
import { RoasChart } from "./_components/roas-chart";
import { TopAdsList } from "./_components/top-ads-list";
import { TopCreatorsList } from "./_components/top-creators-list";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import {
  formatCurrency,
  formatNumber,
  formatRoas,
} from "@/features/dashboard/utils/calculations";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const { kpis, isLoading, error, filteredAds } = useDashboard();

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
      <DashboardFilters />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Budget Total"
          value={formatCurrency(kpis.totalBudget)}
          icon={DollarSign}
          description={`${filteredAds.length} créas`}
        />
        <KPICard
          title="Conversions"
          value={formatNumber(kpis.totalConversions)}
          icon={ShoppingCart}
        />
        <KPICard
          title="ROAS Moyen"
          value={formatRoas(kpis.averageRoas)}
          icon={TrendingUp}
        />
        <KPICard
          title="Coût/Conversion"
          value={formatCurrency(kpis.averageCostPerConversion)}
          icon={Target}
        />
        <KPICard
          title="Revenus"
          value={formatCurrency(kpis.totalRevenue)}
          icon={Zap}
        />
        <KPICard
          title="Nombre de Créas"
          value={formatNumber(kpis.totalAds)}
          icon={Users}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RoasChart />
        <BudgetChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopAdsList />
        <TopCreatorsList />
      </div>
    </div>
  );
}
