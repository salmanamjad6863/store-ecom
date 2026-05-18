import {
  collection,
  getDocs,
  query,
  where,
  type QueryConstraint,
} from "firebase/firestore";

import {
  getDummyProductBySlug,
  mergeWithDummyProducts,
} from "@/lib/data/dummy-products";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getClientFirestore } from "@/lib/firebase/client";
import type { Product } from "@/types/product";

import { mapProductDoc } from "./mappers";

type FetchProductsOptions = {
  type?: string;
  includeHidden?: boolean;
};

export async function fetchProducts(options: FetchProductsOptions = {}): Promise<Product[]> {
  const { type, includeHidden = false } = options;
  const db = getClientFirestore();
  const constraints: QueryConstraint[] = [];

  if (!includeHidden) {
    constraints.push(where("hidden", "==", false));
  }

  const productsQuery = query(collection(db, COLLECTIONS.products), ...constraints);
  const snapshot = await getDocs(productsQuery);

  let products = snapshot.docs
    .map((doc) => mapProductDoc(doc))
    .filter((product): product is Product => product !== null);

  products = mergeWithDummyProducts(products);

  if (type) {
    products = products.filter((product) => product.type === type);
  }

  return products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const dummy = getDummyProductBySlug(slug);

  if (dummy) {
    return dummy;
  }

  const db = getClientFirestore();
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.products),
      where("slug", "==", slug),
      where("hidden", "==", false),
    ),
  );

  const product = snapshot.docs[0];

  return product ? mapProductDoc(product) : null;
}

export async function fetchProductTypes(): Promise<string[]> {
  const products = await fetchProducts();
  const types = new Set(products.map((product) => product.type).filter(Boolean));
  return Array.from(types).sort();
}
