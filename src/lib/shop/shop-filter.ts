import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries/keys";
import { reviveProducts } from "@/lib/queries/product-serialization";
import type { Product } from "@/types/product";

import { filterCatalogProducts } from "./filter-catalog-products";

export type ShopFilter = {
  modelId?: string;
  theme?: string;
};

export function shopFiltersMatch(a: ShopFilter, b: ShopFilter): boolean {
  return (
    (a.modelId ?? undefined) === (b.modelId ?? undefined) &&
    (a.theme ?? undefined) === (b.theme ?? undefined)
  );
}

/** Instant filtered list from the hydrated full-catalog cache. */
export function seedFilteredCatalogCache(
  queryClient: QueryClient,
  filter: ShopFilter,
): Product[] | undefined {
  const catalog = queryClient.getQueryData<Product[]>(queryKeys.products.list({}));

  if (!catalog?.length) {
    return undefined;
  }

  const filtered = filterCatalogProducts(reviveProducts(catalog), filter);

  queryClient.setQueryData(queryKeys.products.list(filter), filtered);

  return filtered;
}
