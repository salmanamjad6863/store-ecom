import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { COLLECTIONS, SUBCOLLECTIONS } from "@/lib/firebase/collections";
import { getClientFirestore } from "@/lib/firebase/client";
import { toFirestoreData } from "@/lib/utils/firestore-payload";
import type { ProductVariant, VariantInput } from "@/types/product-variant";

import { mapVariantDoc } from "./mappers";

export async function fetchVariantsForProduct(productId: string): Promise<ProductVariant[]> {
  const db = getClientFirestore();
  const snapshot = await getDocs(
    collection(db, COLLECTIONS.products, productId, SUBCOLLECTIONS.variants),
  );

  return snapshot.docs
    .map((variantDoc) => mapVariantDoc(variantDoc, productId))
    .filter((variant): variant is ProductVariant => variant !== null)
    .sort((a, b) => a.modelName.localeCompare(b.modelName));
}

export async function fetchVariantById(
  productId: string,
  variantId: string,
): Promise<ProductVariant | null> {
  const db = getClientFirestore();
  const snapshot = await getDocs(
    collection(db, COLLECTIONS.products, productId, SUBCOLLECTIONS.variants),
  );

  const variantDoc = snapshot.docs.find((doc) => doc.id === variantId);
  return variantDoc ? mapVariantDoc(variantDoc, productId) : null;
}

export async function saveProductVariants(
  productId: string,
  variants: VariantInput[],
): Promise<ProductVariant[]> {
  const db = getClientFirestore();
  const variantsRef = collection(db, COLLECTIONS.products, productId, SUBCOLLECTIONS.variants);
  const existing = await getDocs(variantsRef);
  const batch = writeBatch(db);

  for (const variantDoc of existing.docs) {
    batch.delete(variantDoc.ref);
  }

  const saved: ProductVariant[] = [];

  for (const variant of variants) {
    const variantRef = variant.id
      ? doc(db, COLLECTIONS.products, productId, SUBCOLLECTIONS.variants, variant.id)
      : doc(collection(db, COLLECTIONS.products, productId, SUBCOLLECTIONS.variants));

    batch.set(
      variantRef,
      toFirestoreData({
        colorId: variant.colorId,
        modelId: variant.modelId,
        modelName: variant.modelName,
        images: variant.images,
        quantity: variant.quantity,
        price: variant.price ?? null,
        sku: variant.sku ?? null,
        updatedAt: serverTimestamp(),
      }),
    );

    saved.push({
      id: variantRef.id,
      productId,
      colorId: variant.colorId,
      modelId: variant.modelId,
      modelName: variant.modelName,
      images: variant.images,
      quantity: variant.quantity,
      price: variant.price,
      sku: variant.sku,
    });
  }

  await batch.commit();
  return saved;
}

export async function deleteAllVariants(productId: string): Promise<void> {
  const db = getClientFirestore();
  const snapshot = await getDocs(
    collection(db, COLLECTIONS.products, productId, SUBCOLLECTIONS.variants),
  );
  const batch = writeBatch(db);

  for (const variantDoc of snapshot.docs) {
    batch.delete(variantDoc.ref);
  }

  await batch.commit();
}
