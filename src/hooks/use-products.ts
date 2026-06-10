"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries/keys";
import { productQueryDefaults } from "@/lib/queries/product-query-options";
import { reviveProducts } from "@/lib/queries/product-serialization";
import { fetchProducts, fetchProductTypes } from "@/lib/queries/products";

type UseProductsOptions = {
  type?: string;
  modelId?: string;
  theme?: string;
  includeHidden?: boolean;
};

export function useProducts(options: UseProductsOptions = {}) {
  const { type, modelId, theme, includeHidden } = options;

  return useQuery({
    queryKey: queryKeys.products.list({ type, modelId, theme }),
    queryFn: () => fetchProducts({ type, modelId, theme, includeHidden }),
    select: reviveProducts,
    ...productQueryDefaults,
    placeholderData: (previousData) => previousData,
  });
}

export function useProductTypes() {
  return useQuery({
    queryKey: queryKeys.products.types,
    queryFn: fetchProductTypes,
    ...productQueryDefaults,
  });
}
