"use client";

import { useEffect, useMemo } from "react";

import { useProductSkeletonCount } from "@/hooks/use-product-skeleton-count";
import { useProducts } from "@/hooks/use-products";
import { shopFiltersMatch } from "@/lib/shop/shop-filter";
import { useModelFilterDrawer } from "@/providers/model-filter-drawer-provider";
import type { Product } from "@/types/product";

type UseShopCatalogOptions = {
  routeModelId?: string;
  routeTheme?: string;
  initialProducts?: Product[];
  skeletonCountHint?: number;
};

export function useShopCatalog({
  routeModelId,
  routeTheme,
  initialProducts,
  skeletonCountHint,
}: UseShopCatalogOptions) {
  const { optimisticFilter, clearOptimisticFilter } = useModelFilterDrawer();

  const modelId =
    optimisticFilter !== null ? optimisticFilter.modelId : routeModelId;
  const theme =
    optimisticFilter !== null
      ? (optimisticFilter.theme ?? undefined)
      : routeTheme;

  useEffect(() => {
    if (!optimisticFilter) {
      return;
    }

    if (
      shopFiltersMatch(
        {
          modelId: optimisticFilter.modelId,
          theme: optimisticFilter.theme ?? undefined,
        },
        { modelId: routeModelId, theme: routeTheme },
      )
    ) {
      clearOptimisticFilter();
    }
  }, [optimisticFilter, routeModelId, routeTheme, clearOptimisticFilter]);

  const { data: products, isPending, isError } = useProducts({ modelId, theme });

  const routeMatchesOptimistic =
    optimisticFilter !== null &&
    shopFiltersMatch(
      {
        modelId: optimisticFilter.modelId,
        theme: optimisticFilter.theme ?? undefined,
      },
      { modelId: routeModelId, theme: routeTheme },
    );

  const resolvedProducts = useMemo(
    () =>
      products ??
      (optimisticFilter === null || routeMatchesOptimistic ? initialProducts : undefined),
    [products, optimisticFilter, routeMatchesOptimistic, initialProducts],
  );

  const skeletonCount = useProductSkeletonCount({
    products: resolvedProducts,
    modelId,
    theme,
    fallbackCount: skeletonCountHint,
  });

  return {
    modelId,
    theme,
    products: resolvedProducts,
    showSkeleton: isPending && !resolvedProducts,
    isError,
    skeletonCount,
  };
}
