import { collection, getDocs, query, where } from "firebase/firestore";

import { getDummyProductBySlug } from "@/lib/data/dummy-products";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getServerFirestore } from "@/lib/firebase/server";
import type { Product } from "@/types/product";

import { mapProductDoc } from "./mappers";

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
