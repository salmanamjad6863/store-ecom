"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries/keys";
import { productQueryDefaults } from "@/lib/queries/product-query-options";
import { fetchProductBySlug } from "@/lib/queries/products";
import type { Product } from "@/types/product";

export function useProduct(slug: string, initialData?: Product) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: () => fetchProductBySlug(slug),
    enabled: Boolean(slug),
    initialData,
    ...productQueryDefaults,
  });
}
