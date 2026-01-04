/**
 * AG1 Advertisement Data Types
 * Types for Meta Ads dashboard data from AG1-Data.csv
 */

export type AdStatus = "En ligne" | "Arrêtée" | "En pause" | "Archivée";

export type ContentType =
  | "Image statique"
  | "Motion/Vidéo"
  | "Podcast"
  | "Témoignage"
  | "UGC";

export type MarketingAngle =
  | "Digestion"
  | "Promo"
  | "Science"
  | "Voyage"
  | "Routine matinale"
  | "Immunité"
  | "Lifestyle"
  | "Busy Pro"
  | "Sport"
  | "Énergie";

export type Hook =
  | "Challenge"
  | "Avant/Après"
  | "Test goût"
  | "Comparatif"
  | "Témoignage"
  | "Une journée avec moi"
  | "Morning Ritual"
  | "Explication science";

export type Product =
  | "AG1 Powder"
  | "AG1 Travel Packs"
  | "Abonnement"
  | "Bundle Complet"
  | "Omega-3"
  | "Shaker"
  | "Vitamine D3+K2";

export type Month =
  | "Juillet 2025"
  | "Août 2025"
  | "Septembre 2025"
  | "Octobre 2025"
  | "Novembre 2025";

/**
 * Raw advertisement data from CSV
 */
export type Advertisement = {
  id: string;
  name: string;
  product: string;
  creator: string;
  contentType: string;
  marketingAngle: string;
  hook: string;
  audience: string;
  month: string;
  adSetName: string;
  campaignName: string;
  status: AdStatus;
  launchDate: string;
  reach: number;
  impressions: number;
  frequency: number;
  clicks: number;
  conversions: number;
  budget: number;
  revenue: number;
  roas: number;
  cpm: number;
  cpc: number;
  ctr: number;
  costPerConversion: number;
  conversionRate: number;
  hookRate: number | null;
  averageBasket: number;
  previewLink: string;
  adSetId: string;
};

/**
 * Dashboard filter state
 */
export type DashboardFilters = {
  product: string | null;
  creator: string | null;
  contentType: string | null;
  month: string | null;
  status: string | null;
  search: string;
};

/**
 * KPI summary data
 */
export type KPISummary = {
  totalBudget: number;
  totalConversions: number;
  averageRoas: number;
  averageCostPerConversion: number;
  totalRevenue: number;
  totalAds: number;
};

/**
 * Chart data for ROAS by month
 */
export type RoasByMonthData = {
  month: string;
  roas: number;
  budget: number;
};

/**
 * Chart data for budget by product
 */
export type BudgetByProductData = {
  product: string;
  budget: number;
  fill: string;
};

/**
 * Top performer data
 */
export type TopPerformer = {
  id: string;
  name: string;
  value: number;
  secondaryValue?: string;
};

/**
 * Creator performance data
 */
export type CreatorPerformance = {
  creator: string;
  conversions: number;
  budget: number;
  roas: number;
};
