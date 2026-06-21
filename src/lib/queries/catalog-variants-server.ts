import type { Product, ProductWithVariants } from "@/types/product";

import {
  attachVariantsToProducts,
  buildProductVariantsMap,
} from "./products-server";

/** Attach variant rows for all catalog products (parallel Firestore reads). */
export async function resolveCatalogWithVariants(
  products: Product[],
): Promise<ProductWithVariants[]> {
  const variantMap = await buildProductVariantsMap(products);
  return attachVariantsToProducts(products, variantMap);
}
