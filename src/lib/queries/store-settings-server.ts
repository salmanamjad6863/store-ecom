import { doc, getDoc } from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { getServerFirestore } from "@/lib/firebase/server";
import type { Product } from "@/types/product";
import {
  FEATURED_HERO_PRODUCT_COUNT,
  HOMEPAGE_SETTINGS_DOC_ID,
  type HomepageSettings,
} from "@/types/store-settings";

export async function fetchHomepageSettingsOnServer(): Promise<HomepageSettings> {
  const db = getServerFirestore();
  const snapshot = await getDoc(
    doc(db, COLLECTIONS.storeSettings, HOMEPAGE_SETTINGS_DOC_ID),
  );

  if (!snapshot.exists()) {
    return { featuredProductIds: [] };
  }

  const data = snapshot.data();
  const ids = Array.isArray(data.featuredProductIds)
    ? data.featuredProductIds.slice(0, FEATURED_HERO_PRODUCT_COUNT).map(String)
    : [];

  while (ids.length < FEATURED_HERO_PRODUCT_COUNT) {
    ids.push("");
  }

  return { featuredProductIds: ids };
}

/** Resolve hero products from an already-fetched catalog (no extra Firestore read). */
export function resolveFeaturedHeroProductsFromCatalog(
  products: Product[],
  featuredProductIds: string[],
): Product[] {
  const configuredIds = featuredProductIds.filter((id) => id.length > 0);

  if (configuredIds.length === 0) {
    return products.slice(0, FEATURED_HERO_PRODUCT_COUNT);
  }

  const byId = new Map(products.map((product) => [product.id, product]));

  return configuredIds
    .map((id) => byId.get(id))
    .filter((product): product is Product => product !== undefined && !product.hidden)
    .slice(0, FEATURED_HERO_PRODUCT_COUNT);
}
