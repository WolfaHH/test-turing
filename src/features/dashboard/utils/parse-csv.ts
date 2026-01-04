import type { Advertisement, AdStatus } from "../types";

/**
 * Parse CSV content into Advertisement objects
 */
export function parseCSV(csvContent: string): Advertisement[] {
  const lines = csvContent.split("\n");
  if (lines.length < 2) return [];

  // Skip header row
  const dataLines = lines.slice(1);

  return dataLines
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      const values = parseCSVLine(line);

      return {
        id: `ad-${index}`, // Unique ID based on row index
        name: values[0] || "",
        product: values[1] || "",
        creator: values[2] || "—",
        contentType: values[3] || "",
        marketingAngle: values[4] || "",
        hook: values[5] || "",
        audience: values[6] || "",
        month: values[7] || "",
        adSetName: values[8] || "",
        campaignName: values[9] || "",
        status: (values[10] as AdStatus | undefined) ?? "Archivée",
        launchDate: values[11] || "",
        reach: parseNumber(values[12]),
        impressions: parseNumber(values[13]),
        frequency: parseNumber(values[14]),
        clicks: parseNumber(values[15]),
        conversions: parseNumber(values[16]),
        budget: parseNumber(values[17]),
        revenue: parseNumber(values[18]),
        roas: parseNumber(values[19]),
        cpm: parseNumber(values[20]),
        cpc: parseNumber(values[21]),
        ctr: parseNumber(values[22]),
        costPerConversion: parseNumber(values[23]),
        conversionRate: parseNumber(values[24]),
        hookRate: values[25] === "—" ? null : parseNumber(values[25]),
        averageBasket: parseNumber(values[26]),
        previewLink: values[27] || "",
        adSetId: values[28] || "",
      };
    });
}

/**
 * Parse a single CSV line handling quoted fields with commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Parse a string to number, handling French decimal format
 */
function parseNumber(value: string): number {
  if (!value || value === "—") return 0;
  // Handle both dot and comma as decimal separator
  const normalized = value.replace(",", ".");
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}

/**
 * Extract unique values from advertisements for filters
 */
export function extractFilterOptions(ads: Advertisement[]) {
  const products = [...new Set(ads.map((ad) => ad.product))]
    .filter(Boolean)
    .sort();
  const creators = [...new Set(ads.map((ad) => ad.creator))]
    .filter((c) => c && c !== "—")
    .sort();
  const contentTypes = [...new Set(ads.map((ad) => ad.contentType))]
    .filter(Boolean)
    .sort();
  const months = [...new Set(ads.map((ad) => ad.month))]
    .filter(Boolean)
    .sort(sortMonths);
  const statuses = [...new Set(ads.map((ad) => ad.status))].filter(Boolean);

  return {
    products,
    creators,
    contentTypes,
    months,
    statuses,
  };
}

/**
 * Sort months chronologically
 */
function sortMonths(a: string, b: string): number {
  const monthOrder: Record<string, number> = {
    "Juillet 2025": 1,
    "Août 2025": 2,
    "Septembre 2025": 3,
    "Octobre 2025": 4,
    "Novembre 2025": 5,
  };
  return (monthOrder[a] || 0) - (monthOrder[b] || 0);
}
