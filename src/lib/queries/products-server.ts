import { collection, doc, getDoc, getDocs, query, where, type QueryConstraint } from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { getServerFirestore } from "@/lib/firebase/server";
import type { Product, ProductWithVariants } from "@/types/product";

import { mapProductDoc } from "./mappers";
import { fetchVariantsForProductServer } from "./variants-server";

type FetchProductsOnServerOptions = {
  type?: string;
  modelId?: string;
  theme?: string;
  includeHidden?: boolean;
};

export async function fetchProductsOnServer(
  options: FetchProductsOnServerOptions = {},
): Promise<Product[]> {
  const { type, modelId, theme, includeHidden = false } = options;
  const db = getServerFirestore();
  const constraints: QueryConstraint[] = [];

  if (!includeHidden) {
    constraints.push(where("hidden", "==", false));
  }

  if (modelId) {
    constraints.push(where("availableModelIds", "array-contains", modelId));
  }

  const snapshot = await getDocs(query(collection(db, COLLECTIONS.products), ...constraints));

  let products = snapshot.docs
    .map((productDoc) => mapProductDoc(productDoc))
    .filter((product): product is Product => product !== null);

  if (type) {
    products = products.filter((product) => product.type === type);
  }

  if (theme) {
    products = products.filter(
      (product) => product.theme.toLowerCase() === theme.toLowerCase(),
    );
  }

  if (modelId) {
    products = products.filter(
      (product) =>
        !product.hasVariants || (product.availableModelIds ?? []).includes(modelId),
    );
  }

  return products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function fetchProductsByIdsOnServer(ids: string[]): Promise<Product[]> {
  const uniqueIds = [...new Set(ids)];

  if (uniqueIds.length === 0) {
    return [];
  }

  const db = getServerFirestore();
  const results: Product[] = [];

  for (const id of uniqueIds) {
    const snapshot = await getDoc(doc(db, COLLECTIONS.products, id));
    const product = mapProductDoc(snapshot);
    if (product) {
      results.push(product);
    }
  }

  return results;
}

/** Server-only product fetch for RSC pages (e.g. /shop/[slug]). */
export async function fetchProductBySlugOnServer(slug: string): Promise<Product | null> {
  const db = getServerFirestore();
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.products),
      where("slug", "==", slug),
      where("hidden", "==", false),
    ),
  );

  const productDoc = snapshot.docs[0];

  return productDoc ? mapProductDoc(productDoc) : null;
}

export async function fetchProductWithVariantsBySlugOnServer(
  slug: string,
): Promise<ProductWithVariants | null> {
  const product = await fetchProductBySlugOnServer(slug);
  if (!product) {
    return null;
  }

  const variants = product.hasVariants
    ? await fetchVariantsForProductServer(product.id)
    : [];

  return { ...product, variants };
}
