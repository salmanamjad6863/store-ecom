"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries/keys";
import { productQueryDefaults } from "@/lib/queries/product-query-options";
import { fetchProducts, fetchProductTypes } from "@/lib/queries/products";

type UseProductsOptions = {
  type?: string;
  includeHidden?: boolean;
};

export function useProducts(options: UseProductsOptions = {}) {
  const { type, includeHidden } = options;

  return useQuery({
    queryKey: queryKeys.products.list(type),
    queryFn: () => fetchProducts({ type, includeHidden }),
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
