import { collection, getDocs, query, where } from "firebase/firestore";

import {
  getDummyProductBySlug,
  getDummyProductWithVariantsBySlug,
} from "@/lib/data/dummy-products";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getServerFirestore } from "@/lib/firebase/server";
import type { Product, ProductWithVariants } from "@/types/product";

import { mapProductDoc } from "./mappers";
import { fetchVariantsForProductServer } from "./variants-server";

/** Server-only product fetch for RSC pages (e.g. /shop/[slug]). */
export async function fetchProductBySlugOnServer(slug: string): Promise<Product | null> {
  const dummy = getDummyProductBySlug(slug);

  if (dummy) {
    return dummy;
  }

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
  const dummy = getDummyProductWithVariantsBySlug(slug);
  if (dummy) {
    return dummy;
  }

  const product = await fetchProductBySlugOnServer(slug);
  if (!product) {
    return null;
  }

  const variants = product.hasVariants
    ? await fetchVariantsForProductServer(product.id)
    : [];

  return { ...product, variants };
}
