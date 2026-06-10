import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries/keys";
import { productQueryDefaults } from "@/lib/queries/product-query-options";
import { fetchProductWithVariantsBySlug, fetchProductWithVariantsById } from "@/lib/queries/products";

export function prefetchProductBySlug(queryClient: QueryClient, slug: string) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.products.detailWithVariants(slug),
    queryFn: () => fetchProductWithVariantsBySlug(slug),
    ...productQueryDefaults,
  });
}

export function prefetchProductById(queryClient: QueryClient, id: string) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.products.detailWithVariantsById(id),
    queryFn: () => fetchProductWithVariantsById(id),
    ...productQueryDefaults,
  });
}
