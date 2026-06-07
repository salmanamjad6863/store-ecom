"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries/keys";
import { productQueryDefaults } from "@/lib/queries/product-query-options";
import {
  fetchDesignProductsWithVariants,
  fetchProductWithVariantsBySlug,
  fetchShopPhoneModelIds,
  fetchShopThemes,
  fetchSiblingProductsByTheme,
} from "@/lib/queries/products";
import type { ProductWithVariants } from "@/types/product";

export function useProductWithVariants(slug: string, initialData?: ProductWithVariants) {
  return useQuery({
    queryKey: queryKeys.products.detailWithVariants(slug),
    queryFn: () => fetchProductWithVariantsBySlug(slug),
    enabled: Boolean(slug),
    initialData,
    ...productQueryDefaults,
  });
}

export function useShopPhoneModelIds() {
  return useQuery({
    queryKey: queryKeys.products.shopModels,
    queryFn: fetchShopPhoneModelIds,
    ...productQueryDefaults,
  });
}

export function useShopThemes() {
  return useQuery({
    queryKey: queryKeys.products.shopThemes,
    queryFn: fetchShopThemes,
    ...productQueryDefaults,
  });
}

export function useSiblingProducts(theme: string, excludeSlug: string) {
  return useQuery({
    queryKey: queryKeys.products.siblings(theme, excludeSlug),
    queryFn: () => fetchSiblingProductsByTheme(theme, excludeSlug),
    enabled: Boolean(theme.trim()),
    ...productQueryDefaults,
  });
}

export function useDesignProductsWithVariants(
  theme: string,
  initialProduct: ProductWithVariants,
) {
  return useQuery({
    queryKey: queryKeys.products.designWithVariants(theme),
    queryFn: () => fetchDesignProductsWithVariants(theme),
    enabled: Boolean(theme.trim()),
    initialData: [initialProduct],
    ...productQueryDefaults,
  });
}
