import type { Metadata } from "next";

import { env } from "@/lib/env";

const DEFAULT_SITE_URL = "https://www.ibloomelara.com";

export function getSiteUrl(path = ""): string {
  const base = env.siteUrl.replace(/\/$/, "");
  if (!path) {
    return base;
  }

  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

export const STORE_SEO = {
  name: env.storeName,
  tagline: "iPhone covers crafted for the woman who notices the details.",
  defaultDescription:
    "Shop premium iPhone covers at iBloom Elara. Free delivery on orders above Rs. 5,000. Cash on delivery across Pakistan.",
  instagramUrl: "https://www.instagram.com/ibloomelara/?hl=en",
} as const;

export function truncateSeoDescription(text: string, maxLength = 160): string {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 1).trim()}…`;
}

export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
};

export function buildDefaultOpenGraph(
  title: string,
  description: string,
  path = "/",
): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    locale: env.currency.locale.replace("-", "_"),
    url: getSiteUrl(path),
    siteName: STORE_SEO.name,
    title,
    description,
  };
}
