import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
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

/** Admin: all Firestore products (no dummy merge). */
export async function fetchAdminProducts(): Promise<Product[]> {
  const db = getClientFirestore();
  const snapshot = await getDocs(collection(db, COLLECTIONS.products));

  return snapshot.docs
    .map((productDoc) => mapProductDoc(productDoc))
    .filter((product): product is Product => product !== null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const db = getClientFirestore();
  const snapshot = await getDoc(doc(db, COLLECTIONS.products, id));

  return mapProductDoc(snapshot);
}

export type ProductInput = {
  name: string;
  slug: string;
  type: string;
  description: string;
  images: string[];
  price: number;
  salePrice?: number;
  onSale: boolean;
  quantity: number;
  hidden: boolean;
};

export async function createProduct(input: ProductInput): Promise<string> {
  const db = getClientFirestore();

  const docRef = await addDoc(collection(db, COLLECTIONS.products), {
    name: input.name,
    slug: input.slug,
    type: input.type,
    description: input.description,
    images: input.images,
    price: input.price,
    ...(input.onSale && input.salePrice !== undefined ? { salePrice: input.salePrice } : {}),
    onSale: input.onSale,
    quantity: input.quantity,
    hidden: input.hidden,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateProduct(id: string, input: ProductInput): Promise<void> {
  const db = getClientFirestore();

  await updateDoc(doc(db, COLLECTIONS.products, id), {
    name: input.name,
    slug: input.slug,
    type: input.type,
    description: input.description,
    images: input.images,
    price: input.price,
    salePrice: input.onSale && input.salePrice !== undefined ? input.salePrice : null,
    onSale: input.onSale,
    quantity: input.quantity,
    hidden: input.hidden,
    updatedAt: serverTimestamp(),
  });
}
