"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { queryKeys } from "@/lib/queries/keys";
import {
  resolveProductSkeletonCount,
  writeStoredProductSkeletonCount,
} from "@/lib/skeleton/product-count";
import type { Product } from "@/types/product";

type UseProductSkeletonCountOptions = {
  products?: Product[];
  modelId?: string;
  theme?: string;
  type?: string;
  limit?: number;
  fallbackCount?: number;
};

export function useProductSkeletonCount({
  products,
  modelId,
  theme,
  type,
  limit,
  fallbackCount,
}: UseProductSkeletonCountOptions) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.products.list({ type, modelId, theme });

  const count = useMemo(
    () =>
      resolveProductSkeletonCount({
        queryClient,
        queryKey,
        products,
        limit,
        fallbackCount,
      }),
    [queryClient, queryKey, products, limit, fallbackCount],
  );

  useEffect(() => {
    if (products) {
      writeStoredProductSkeletonCount(queryKey, products.length);
    }
  }, [products, queryKey]);

  return count;
}
