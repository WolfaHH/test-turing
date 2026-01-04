"use client";

import { useState, useEffect, useMemo } from "react";
import type { Advertisement, DashboardFilters } from "../types";
import { parseCSV, extractFilterOptions } from "../utils/parse-csv";
import {
  filterAdvertisements,
  calculateKPIs,
  calculateRoasByMonth,
  calculateBudgetByProduct,
  getTopAdsByRoas,
  getTopCreatorsByConversions,
} from "../utils/calculations";

export function useDashboardData() {
  const [allAds, setAllAds] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load CSV data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/data/AG1-Data.csv");
        if (!response.ok) {
          throw new Error("Failed to load data");
        }
        const csvContent = await response.text();
        const ads = parseCSV(csvContent);
        setAllAds(ads);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, []);

  // Extract filter options from all data
  const filterOptions = useMemo(() => extractFilterOptions(allAds), [allAds]);

  return {
    allAds,
    filterOptions,
    isLoading,
    error,
  };
}

export function useFilteredData(
  allAds: Advertisement[],
  filters: DashboardFilters,
) {
  // Filter advertisements
  const filteredAds = useMemo(
    () => filterAdvertisements(allAds, filters),
    [allAds, filters],
  );

  // Calculate KPIs
  const kpis = useMemo(() => calculateKPIs(filteredAds), [filteredAds]);

  // Calculate chart data
  const roasByMonth = useMemo(
    () => calculateRoasByMonth(filteredAds),
    [filteredAds],
  );

  const budgetByProduct = useMemo(
    () => calculateBudgetByProduct(filteredAds),
    [filteredAds],
  );

  // Calculate top performers
  const topAdsByRoas = useMemo(
    () => getTopAdsByRoas(filteredAds),
    [filteredAds],
  );

  const topCreators = useMemo(
    () => getTopCreatorsByConversions(filteredAds),
    [filteredAds],
  );

  return {
    filteredAds,
    kpis,
    roasByMonth,
    budgetByProduct,
    topAdsByRoas,
    topCreators,
  };
}
