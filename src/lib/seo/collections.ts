import type { Metadata } from "next";

import type { PhoneModel } from "@/types/phone-model";

import { buildDefaultOpenGraph, getSiteUrl, truncateSeoDescription } from "./site";

export const MODEL_CASES_SUFFIX = "-cases";
export const FOR_HER_PATH = "/shop/for-her";

/** Indexable model landing pages: /shop/iphone-15-cases */
export function getModelCollectionPath(modelSlug: string): string {
  return `/shop/${modelSlug}${MODEL_CASES_SUFFIX}`;
}

export function parseModelCollectionSlug(slug: string): string | null {
  if (!slug.endsWith(MODEL_CASES_SUFFIX)) {
    return null;
  }

  const modelSlug = slug.slice(0, -MODEL_CASES_SUFFIX.length);
  return modelSlug.length > 0 ? modelSlug : null;
}

export function resolveModelFromCollectionSlug(
  slug: string,
  phoneModels: PhoneModel[],
): PhoneModel | null {
  const modelSlug = parseModelCollectionSlug(slug);
  if (!modelSlug) {
    return null;
  }

  return phoneModels.find((model) => model.slug === modelSlug || model.id === modelSlug) ?? null;
}

export function buildShopModelHref(modelId?: string, theme?: string | null): string {
  const themeQuery = theme ? `?theme=${encodeURIComponent(theme)}` : "";

  if (!modelId) {
    return theme ? `/shop${themeQuery}` : "/shop";
  }

  return `${getModelCollectionPath(modelId)}${themeQuery}`;
}

export function getActiveModelIdFromPath(pathname: string, queryModelId?: string | null): string | undefined {
  const slug = pathname.split("/").pop();
  if (slug && pathname.startsWith("/shop/")) {
    const modelSlug = parseModelCollectionSlug(slug);
    if (modelSlug) {
      return modelSlug;
    }
  }

  return queryModelId ?? undefined;
}

/** Shop listing routes where model-filter navigation should preserve scroll. */
export function isShopCatalogListingPath(pathname: string): boolean {
  if (pathname === "/shop" || pathname === FOR_HER_PATH) {
    return true;
  }

  const slug = pathname.split("/").pop();
  if (!slug || !pathname.startsWith("/shop/")) {
    return false;
  }

  return parseModelCollectionSlug(slug) !== null;
}

export function buildModelCollectionTitle(modelName: string): string {
  return `${modelName} Covers in Pakistan`;
}

export function buildModelCollectionDescription(modelName: string): string {
  return truncateSeoDescription(
    `Shop premium ${modelName} covers designed for women. Stylish iPhone covers with cash on delivery across Pakistan.`,
  );
}

export function buildModelCollectionMetadata(model: PhoneModel): Metadata {
  const title = buildModelCollectionTitle(model.name);
  const description = buildModelCollectionDescription(model.name);
  const path = getModelCollectionPath(model.slug);

  return {
    title,
    description,
    alternates: {
      canonical: getSiteUrl(path),
    },
    openGraph: buildDefaultOpenGraph(title, description, path),
  };
}

export const FOR_HER_SEO = {
  title: "iPhone Covers for Women",
  description: truncateSeoDescription(
    "Premium iPhone covers for women and girls. Cute, aesthetic, designer styles with cash on delivery across Pakistan.",
  ),
} as const;

export function buildForHerMetadata(): Metadata {
  return {
    title: FOR_HER_SEO.title,
    description: FOR_HER_SEO.description,
    alternates: {
      canonical: getSiteUrl(FOR_HER_PATH),
    },
    openGraph: buildDefaultOpenGraph(FOR_HER_SEO.title, FOR_HER_SEO.description, FOR_HER_PATH),
  };
}

/** Popular models linked in footer and internal navigation. */
export const FEATURED_MODEL_SLUGS = [
  "iphone-16",
  "iphone-15",
  "iphone-14",
  "iphone-13",
] as const;
