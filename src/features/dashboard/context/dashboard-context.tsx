"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Advertisement, DashboardFilters } from "../types";
import { useDashboardData, useFilteredData } from "../hooks/use-dashboard-data";

type DashboardContextValue = {
  // Data
  allAds: Advertisement[];
  filteredAds: Advertisement[];
  isLoading: boolean;
  error: string | null;

  // Filter options
  filterOptions: {
    products: string[];
    creators: string[];
    contentTypes: string[];
    months: string[];
    statuses: string[];
  };

  // Current filters
  filters: DashboardFilters;
  setFilters: (filters: DashboardFilters) => void;
  updateFilter: <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) => void;
  resetFilters: () => void;

  // Computed data
  kpis: ReturnType<typeof useFilteredData>["kpis"];
  roasByMonth: ReturnType<typeof useFilteredData>["roasByMonth"];
  budgetByProduct: ReturnType<typeof useFilteredData>["budgetByProduct"];
  topAdsByRoas: ReturnType<typeof useFilteredData>["topAdsByRoas"];
  topCreators: ReturnType<typeof useFilteredData>["topCreators"];

  // Get single ad by ID
  getAdById: (id: string) => Advertisement | undefined;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

const defaultFilters: DashboardFilters = {
  product: null,
  creator: null,
  contentType: null,
  month: null,
  status: null,
  search: "",
};

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { allAds, filterOptions, isLoading, error } = useDashboardData();
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);

  const {
    filteredAds,
    kpis,
    roasByMonth,
    budgetByProduct,
    topAdsByRoas,
    topCreators,
  } = useFilteredData(allAds, filters);

  const updateFilter = <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const getAdById = (id: string) => {
    return allAds.find((ad) => ad.id === id);
  };

  return (
    <DashboardContext.Provider
      value={{
        allAds,
        filteredAds,
        isLoading,
        error,
        filterOptions,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        kpis,
        roasByMonth,
        budgetByProduct,
        topAdsByRoas,
        topCreators,
        getAdById,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
