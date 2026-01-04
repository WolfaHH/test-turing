import type {
  Advertisement,
  KPISummary,
  RoasByMonthData,
  BudgetByProductData,
  TopPerformer,
  CreatorPerformance,
  DashboardFilters,
} from "../types";

/**
 * Filter advertisements based on current filters
 */
export function filterAdvertisements(
  ads: Advertisement[],
  filters: DashboardFilters,
): Advertisement[] {
  return ads.filter((ad) => {
    if (filters.product && ad.product !== filters.product) return false;
    if (filters.creator && ad.creator !== filters.creator) return false;
    if (filters.contentType && ad.contentType !== filters.contentType)
      return false;
    if (filters.month && ad.month !== filters.month) return false;
    if (filters.status && ad.status !== filters.status) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesName = ad.name.toLowerCase().includes(search);
      const matchesCreator = ad.creator.toLowerCase().includes(search);
      const matchesProduct = ad.product.toLowerCase().includes(search);
      if (!matchesName && !matchesCreator && !matchesProduct) return false;
    }
    return true;
  });
}

/**
 * Calculate KPI summary from filtered advertisements
 */
export function calculateKPIs(ads: Advertisement[]): KPISummary {
  if (ads.length === 0) {
    return {
      totalBudget: 0,
      totalConversions: 0,
      averageRoas: 0,
      averageCostPerConversion: 0,
      totalRevenue: 0,
      totalAds: 0,
    };
  }

  const totalBudget = ads.reduce((sum, ad) => sum + ad.budget, 0);
  const totalConversions = ads.reduce((sum, ad) => sum + ad.conversions, 0);
  const totalRevenue = ads.reduce((sum, ad) => sum + ad.revenue, 0);

  // Average ROAS weighted by budget
  const averageRoas =
    totalBudget > 0
      ? ads.reduce((sum, ad) => sum + ad.roas * ad.budget, 0) / totalBudget
      : 0;

  // Average cost per conversion
  const averageCostPerConversion =
    totalConversions > 0 ? totalBudget / totalConversions : 0;

  return {
    totalBudget,
    totalConversions,
    averageRoas,
    averageCostPerConversion,
    totalRevenue,
    totalAds: ads.length,
  };
}

/**
 * Calculate ROAS by month for chart
 */
export function calculateRoasByMonth(ads: Advertisement[]): RoasByMonthData[] {
  const monthOrder = [
    "Juillet 2025",
    "Août 2025",
    "Septembre 2025",
    "Octobre 2025",
    "Novembre 2025",
  ];

  const byMonth = new Map<
    string,
    { totalRevenue: number; totalBudget: number }
  >();

  for (const ad of ads) {
    const existing = byMonth.get(ad.month) || {
      totalRevenue: 0,
      totalBudget: 0,
    };
    byMonth.set(ad.month, {
      totalRevenue: existing.totalRevenue + ad.revenue,
      totalBudget: existing.totalBudget + ad.budget,
    });
  }

  return monthOrder
    .filter((month) => byMonth.has(month))
    .map((month) => {
      const data = byMonth.get(month);
      if (!data) return null;
      return {
        month: month.replace(" 2025", ""),
        roas: data.totalBudget > 0 ? data.totalRevenue / data.totalBudget : 0,
        budget: data.totalBudget,
      };
    })
    .filter((item): item is RoasByMonthData => item !== null);
}

/**
 * Calculate budget by product for chart
 */
export function calculateBudgetByProduct(
  ads: Advertisement[],
): BudgetByProductData[] {
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(142, 76%, 36%)",
    "hsl(280, 65%, 60%)",
  ];

  const byProduct = new Map<string, number>();

  for (const ad of ads) {
    const existing = byProduct.get(ad.product) || 0;
    byProduct.set(ad.product, existing + ad.budget);
  }

  return Array.from(byProduct.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([product, budget], index) => ({
      product,
      budget,
      fill: colors[index % colors.length],
    }));
}

/**
 * Get top 5 ads by ROAS
 */
export function getTopAdsByRoas(ads: Advertisement[]): TopPerformer[] {
  return ads
    .filter((ad) => ad.roas > 0)
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 5)
    .map((ad) => ({
      id: ad.id,
      name: ad.name,
      value: ad.roas,
      secondaryValue: ad.product,
    }));
}

/**
 * Get top 5 creators by conversions
 */
export function getTopCreatorsByConversions(
  ads: Advertisement[],
): CreatorPerformance[] {
  const byCreator = new Map<
    string,
    { conversions: number; budget: number; revenue: number }
  >();

  for (const ad of ads) {
    if (ad.creator === "—") continue;
    const existing = byCreator.get(ad.creator) || {
      conversions: 0,
      budget: 0,
      revenue: 0,
    };
    byCreator.set(ad.creator, {
      conversions: existing.conversions + ad.conversions,
      budget: existing.budget + ad.budget,
      revenue: existing.revenue + ad.revenue,
    });
  }

  return Array.from(byCreator.entries())
    .map(([creator, data]) => ({
      creator,
      conversions: data.conversions,
      budget: data.budget,
      roas: data.budget > 0 ? data.revenue / data.budget : 0,
    }))
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, 5);
}

/**
 * Format currency in EUR (full format)
 */
export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format currency compact (3.4M €)
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(".", ",")}M €`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(".", ",")}k €`;
  }
  return `${Math.round(value)} €`;
}

/**
 * Format large numbers with French locale (full)
 */
export function formatNumberFull(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(value));
}

/**
 * Format large numbers compact (3.4M)
 */
export function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(".", ",")}k`;
  }
  return new Intl.NumberFormat("fr-FR").format(Math.round(value));
}

/**
 * Format ROAS value
 */
export function formatRoas(value: number): string {
  return value.toFixed(2);
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Get exact value for tooltip
 */
export function getExactValue(
  value: number,
  type: "currency" | "number",
): string {
  if (type === "currency") {
    return formatCurrencyFull(value);
  }
  return formatNumberFull(value);
}
