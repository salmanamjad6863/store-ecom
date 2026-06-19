import { doc, getDoc } from "firebase/firestore";

import { resolveFeaturedHeroItems, type FeaturedHeroItem } from "@/lib/featured/hero-items";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getServerFirestore } from "@/lib/firebase/server";
import type { Product } from "@/types/product";
import {
  FEATURED_HERO_PRODUCT_COUNT,
  HOMEPAGE_SETTINGS_DOC_ID,
  type HomepageSettings,
} from "@/types/store-settings";

function parseHomepageSettings(data: Record<string, unknown>): HomepageSettings {
  const ids = Array.isArray(data.featuredProductIds)
    ? data.featuredProductIds.slice(0, FEATURED_HERO_PRODUCT_COUNT).map(String)
    : [];
  const colorIds = Array.isArray(data.featuredColorIds)
    ? data.featuredColorIds.slice(0, FEATURED_HERO_PRODUCT_COUNT).map(String)
    : [];

  while (ids.length < FEATURED_HERO_PRODUCT_COUNT) {
    ids.push("");
  }

  while (colorIds.length < FEATURED_HERO_PRODUCT_COUNT) {
    colorIds.push("");
  }

  return {
    featuredProductIds: ids,
    featuredColorIds: colorIds,
  };
}

export async function fetchHomepageSettingsOnServer(): Promise<HomepageSettings> {
  const db = getServerFirestore();
  const snapshot = await getDoc(
    doc(db, COLLECTIONS.storeSettings, HOMEPAGE_SETTINGS_DOC_ID),
  );

  if (!snapshot.exists()) {
    return {
      featuredProductIds: Array.from({ length: FEATURED_HERO_PRODUCT_COUNT }, () => ""),
      featuredColorIds: Array.from({ length: FEATURED_HERO_PRODUCT_COUNT }, () => ""),
    };
  }

  return parseHomepageSettings(snapshot.data());
}

/** Resolve hero products from an already-fetched catalog (no extra Firestore read). */
export function resolveFeaturedHeroProductsFromCatalog(
  products: Product[],
  settings: HomepageSettings,
): FeaturedHeroItem[] {
  return resolveFeaturedHeroItems(products, settings);
}
