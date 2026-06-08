import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { getClientFirestore } from "@/lib/firebase/client";
import { fetchProductsByIds, fetchProducts } from "@/lib/queries/products";
import { toFirestoreData } from "@/lib/utils/firestore-payload";
import type { Product } from "@/types/product";
import {
  FEATURED_HERO_PRODUCT_COUNT,
  HOMEPAGE_SETTINGS_DOC_ID,
  type HomepageSettings,
} from "@/types/store-settings";

export async function fetchHomepageSettings(): Promise<HomepageSettings> {
  const db = getClientFirestore();
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

  return {
    featuredProductIds: ids,
  };
}

export async function saveHomepageFeaturedProducts(productIds: string[]): Promise<void> {
  const db = getClientFirestore();
  const featuredProductIds = productIds
    .slice(0, FEATURED_HERO_PRODUCT_COUNT)
    .map((id) => id.trim());

  await setDoc(
    doc(db, COLLECTIONS.storeSettings, HOMEPAGE_SETTINGS_DOC_ID),
    toFirestoreData({
      featuredProductIds,
      updatedAt: serverTimestamp(),
    }),
    { merge: true },
  );
}

export async function fetchFeaturedHeroProducts(): Promise<Product[]> {
  const { featuredProductIds } = await fetchHomepageSettings();

  if (featuredProductIds.length === 0) {
    const products = await fetchProducts();
    return products.slice(0, FEATURED_HERO_PRODUCT_COUNT);
  }

  const products = await fetchProductsByIds(featuredProductIds);
  const byId = new Map(products.map((product) => [product.id, product]));

  return featuredProductIds
    .filter((id) => id.length > 0)
    .map((id) => byId.get(id))
    .filter((product): product is Product => product !== undefined && !product.hidden)
    .slice(0, FEATURED_HERO_PRODUCT_COUNT);
}
