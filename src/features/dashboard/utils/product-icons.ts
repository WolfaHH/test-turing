/**
 * Product icon mapping
 * Maps product names to their icon paths
 */

export const PRODUCT_ICONS: Record<string, string> = {
  "AG1 Powder": "/images/products/ag1-powder.png",
  "AG1 Travel Packs": "/images/products/ag1-travel-packs.png",
  Abonnement: "/images/products/subscription.png",
  "Bundle Complet": "/images/products/bundle.png",
  "Omega-3": "/images/products/omega3.png",
  Shaker: "/images/products/shaker.png",
  "Vitamine D3+K2": "/images/products/vitamin-d3k2.png",
};

export function getProductIcon(product: string): string | null {
  return PRODUCT_ICONS[product] ?? null;
}
