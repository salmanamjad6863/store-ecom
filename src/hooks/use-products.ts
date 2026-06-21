"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries/keys";
import { productQueryDefaults } from "@/lib/queries/product-query-options";
import { reviveProducts } from "@/lib/queries/product-serialization";
import { fetchProducts, fetchProductTypes } from "@/lib/queries/products";
import { filterCatalogProducts } from "@/lib/shop/filter-catalog-products";
import type { Product } from "@/types/product";

type UseProductsOptions = {
  type?: string;
  modelId?: string;
  theme?: string;
  includeHidden?: boolean;
};

function getCatalogPlaceholder(
  queryClient: ReturnType<typeof useQueryClient>,
  options: UseProductsOptions,
): Product[] | undefined {
  const { type, modelId, theme } = options;
  const hasFilters = Boolean(type || modelId || theme);

  if (!hasFilters) {
    return undefined;
  }

  const catalog = queryClient.getQueryData<Product[]>(queryKeys.products.list({}));

  if (!catalog?.length) {
    return undefined;
  }

  return filterCatalogProducts(reviveProducts(catalog), { type, modelId, theme });
}

export function useProducts(options: UseProductsOptions = {}) {
  const queryClient = useQueryClient();
  const { type, modelId, theme, includeHidden } = options;

  return useQuery({
    queryKey: queryKeys.products.list({ type, modelId, theme }),
    queryFn: () => fetchProducts({ type, modelId, theme, includeHidden }),
    select: reviveProducts,
    ...productQueryDefaults,
    placeholderData: (previousData) =>
      previousData ?? getCatalogPlaceholder(queryClient, { type, modelId, theme }),
  });
}

export function useProductTypes() {
  return useQuery({
    queryKey: queryKeys.products.types,
    queryFn: fetchProductTypes,
    ...productQueryDefaults,
  });
}
