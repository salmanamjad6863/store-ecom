"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries/keys";
import { productQueryDefaults } from "@/lib/queries/product-query-options";
import { deriveShopModelIds, deriveShopThemes } from "@/lib/shop/catalog-derived";
import { fetchPhoneModels } from "@/lib/queries/phone-models";
import { reviveProducts } from "@/lib/queries/product-serialization";
import {
  fetchDesignProductsWithVariants,
  fetchProductWithVariantsBySlug,
  fetchShopPhoneModelIds,
  fetchShopThemes,
  fetchSiblingProductsByTheme,
} from "@/lib/queries/products";
import type { Product } from "@/types/product";
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

async function resolveShopModelIdsFromCache(
  catalogProducts: Product[] | undefined,
): Promise<string[]> {
  if (catalogProducts?.length) {
    const phoneModels = await fetchPhoneModels();
    return deriveShopModelIds(catalogProducts, phoneModels);
  }

  return fetchShopPhoneModelIds();
}

export function useShopPhoneModelIds() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.products.shopModels,
    queryFn: async () => {
      const catalogProducts = queryClient.getQueryData<Product[]>(queryKeys.products.list({}));
      return resolveShopModelIdsFromCache(catalogProducts);
    },
    ...productQueryDefaults,
  });
}

export function useShopThemes() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.products.shopThemes,
    queryFn: async () => {
      const catalogProducts = queryClient.getQueryData<Product[]>(queryKeys.products.list({}));
      if (catalogProducts?.length) {
        return deriveShopThemes(reviveProducts(catalogProducts));
      }

      return fetchShopThemes();
    },
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
