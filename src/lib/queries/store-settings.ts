import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import {
  homepageSettingsFromSlots,
  resolveFeaturedHeroItems,
  type FeaturedHeroItem,
  type FeaturedHeroSlot,
} from "@/lib/featured/hero-items";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getClientFirestore } from "@/lib/firebase/client";
import { fetchProductsByIds, fetchProducts } from "@/lib/queries/products";
import { toFirestoreData } from "@/lib/utils/firestore-payload";
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

export async function fetchHomepageSettings(): Promise<HomepageSettings> {
  const db = getClientFirestore();
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

export async function saveHomepageFeaturedProducts(slots: FeaturedHeroSlot[]): Promise<void> {
  const db = getClientFirestore();
  const { featuredProductIds, featuredColorIds } = homepageSettingsFromSlots(slots);

  await setDoc(
    doc(db, COLLECTIONS.storeSettings, HOMEPAGE_SETTINGS_DOC_ID),
    toFirestoreData({
      featuredProductIds,
      featuredColorIds,
      updatedAt: serverTimestamp(),
    }),
    { merge: true },
  );
}

export async function fetchFeaturedHeroProducts(): Promise<FeaturedHeroItem[]> {
  const settings = await fetchHomepageSettings();
  const configuredIds = settings.featuredProductIds.filter((id) => id.length > 0);

  if (configuredIds.length === 0) {
    const products = await fetchProducts();
    return resolveFeaturedHeroItems(products, settings);
  }

  const products = await fetchProductsByIds(configuredIds);
  return resolveFeaturedHeroItems(products, settings);
}
