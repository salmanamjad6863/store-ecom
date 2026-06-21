import type { Metadata } from "next";

import { buildDefaultOpenGraph, getSiteUrl, truncateSeoDescription } from "./site";

/** Customer-facing product term — use consistently across the site. */
export const PRODUCT_TERM = "cover";
export const PRODUCT_TERM_PLURAL = "covers";

export const SHOP_SEO = {
  title: "Shop iPhone Covers Online",
  description: truncateSeoDescription(
    "Browse premium iPhone covers for women. Designer styles for iPhone 11–17 with cash on delivery across Pakistan.",
  ),
  /** Screen-reader only — keeps SEO without changing the visible layout. */
  srTitle: "Shop iPhone Covers",
} as const;

export const HOME_SEO = {
  title: "Premium iPhone Covers for Women | Pakistan",
  description: truncateSeoDescription(
    "Designer iPhone covers for her. Cute, aesthetic, premium styles with cash on delivery and free delivery over Rs. 5,000 across Pakistan.",
  ),
} as const;

export function buildShopMetadata(options?: { hasFilters?: boolean }): Metadata {
  const { hasFilters = false } = options ?? {};

  return {
    title: SHOP_SEO.title,
    description: SHOP_SEO.description,
    alternates: {
      canonical: getSiteUrl("/shop"),
    },
    openGraph: buildDefaultOpenGraph(SHOP_SEO.title, SHOP_SEO.description, "/shop"),
    robots: hasFilters ? { index: false, follow: true } : undefined,
  };
}

export function buildProductImageAlt(theme: string, colorName?: string): string {
  const colorPart = colorName ? ` in ${colorName}` : "";
  return `${theme} iPhone cover${colorPart} — iBloom Elara`;
}
