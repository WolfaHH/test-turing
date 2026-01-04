"use client";

import {
  DollarSign,
  MousePointerClick,
  Receipt,
  ShoppingCart,
  Target,
  TrendingUp,
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
  formatCurrencyFull,
  formatNumber,
  formatNumberFull,
  formatRoas,
} from "@/features/dashboard/utils/calculations";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-full max-w-2xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

export default function AnalyticsOverviewPage() {
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
      <h1 className="text-xl font-semibold">Overview</h1>

      <DashboardFilters />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Budget dépensé"
          value={formatCurrency(kpis.totalBudget)}
          exactValue={formatCurrencyFull(kpis.totalBudget)}
          icon={DollarSign}
          description={`${filteredAds.length} créas`}
        />
        <KPICard
          title="Conversions"
          value={formatNumber(kpis.totalConversions)}
          exactValue={formatNumberFull(kpis.totalConversions)}
          icon={ShoppingCart}
        />
        <KPICard
          title="ROAS moyen"
          value={formatRoas(kpis.averageRoas)}
          icon={TrendingUp}
        />
        <KPICard
          title="Coût / conv."
          value={formatCurrency(kpis.averageCostPerConversion)}
          exactValue={formatCurrencyFull(kpis.averageCostPerConversion)}
          icon={Target}
        />
        <KPICard
          title="Revenu total"
          value={formatCurrency(kpis.totalRevenue)}
          exactValue={formatCurrencyFull(kpis.totalRevenue)}
          icon={Receipt}
        />
        <KPICard
          title="Créas"
          value={formatNumber(kpis.totalAds)}
          icon={MousePointerClick}
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
