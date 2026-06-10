import { doc, getDoc } from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { getServerFirestore } from "@/lib/firebase/server";
import type { Product } from "@/types/product";
import {
  FEATURED_HERO_PRODUCT_COUNT,
  HOMEPAGE_SETTINGS_DOC_ID,
} from "@/types/store-settings";

import { fetchProductsByIdsOnServer, fetchProductsOnServer } from "./products-server";

export async function fetchFeaturedHeroProductsOnServer(): Promise<Product[]> {
  const db = getServerFirestore();
  const snapshot = await getDoc(
    doc(db, COLLECTIONS.storeSettings, HOMEPAGE_SETTINGS_DOC_ID),
  );

  let featuredProductIds: string[] = [];

  if (snapshot.exists()) {
    const data = snapshot.data();
    featuredProductIds = Array.isArray(data.featuredProductIds)
      ? data.featuredProductIds.slice(0, FEATURED_HERO_PRODUCT_COUNT).map(String)
      : [];
  }

  const configuredIds = featuredProductIds.filter((id) => id.length > 0);

  if (configuredIds.length === 0) {
    const products = await fetchProductsOnServer();
    return products.slice(0, FEATURED_HERO_PRODUCT_COUNT);
  }

  const products = await fetchProductsByIdsOnServer(configuredIds);
  const byId = new Map(products.map((product) => [product.id, product]));

  return configuredIds
    .map((id) => byId.get(id))
    .filter((product): product is Product => product !== undefined && !product.hidden)
    .slice(0, FEATURED_HERO_PRODUCT_COUNT);
}
