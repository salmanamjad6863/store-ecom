import type { MetadataRoute } from "next";

import { fetchPhoneModelsOnServer } from "@/lib/queries/phone-models-server";
import { fetchProductsOnServer } from "@/lib/queries/products-server";
import { FOR_HER_PATH, getModelCollectionPath } from "@/lib/seo/collections";
import { getSiteUrl } from "@/lib/seo/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, phoneModels] = await Promise.all([
    fetchProductsOnServer(),
    fetchPhoneModelsOnServer(),
  ]);
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
      url: getSiteUrl(FOR_HER_PATH),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...phoneModels.map((model) => ({
      url: getSiteUrl(getModelCollectionPath(model.slug)),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
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
