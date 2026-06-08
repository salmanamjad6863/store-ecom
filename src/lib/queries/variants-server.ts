import { collection, getDocs } from "firebase/firestore";

import { COLLECTIONS, SUBCOLLECTIONS } from "@/lib/firebase/collections";
import { getServerFirestore } from "@/lib/firebase/server";
import type { ProductVariant } from "@/types/product-variant";

import { mapVariantDoc } from "./mappers";

export async function fetchVariantsForProductServer(
  productId: string,
): Promise<ProductVariant[]> {
  const db = getServerFirestore();
  const snapshot = await getDocs(
    collection(db, COLLECTIONS.products, productId, SUBCOLLECTIONS.variants),
  );

  return snapshot.docs
    .map((variantDoc) => mapVariantDoc(variantDoc, productId))
    .filter((variant): variant is ProductVariant => variant !== null)
    .sort((a, b) => a.modelName.localeCompare(b.modelName));
}

export async function fetchVariantByIdOnServer(
  productId: string,
  variantId: string,
): Promise<ProductVariant | null> {
  const variants = await fetchVariantsForProductServer(productId);
  return variants.find((variant) => variant.id === variantId) ?? null;
}
