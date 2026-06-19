import type { MetadataRoute } from "next";

import { fetchProductsOnServer } from "@/lib/queries/products-server";
import { getSiteUrl } from "@/lib/seo/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchProductsOnServer();
  const now = new Date();

  return [
    {
      url: getSiteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: getSiteUrl("/shop"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: getSiteUrl("/track-order"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...products.map((product) => ({
      url: getSiteUrl(`/shop/${product.slug}`),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
