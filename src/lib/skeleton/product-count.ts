import type { QueryClient } from "@tanstack/react-query";

import type { Product } from "@/types/product";

const STORAGE_PREFIX = "product-skeleton-count:";

function storageKey(queryKey: readonly unknown[]): string {
  return `${STORAGE_PREFIX}${JSON.stringify(queryKey)}`;
}

export function readStoredProductSkeletonCount(queryKey: readonly unknown[]): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = sessionStorage.getItem(storageKey(queryKey));
    if (!value) {
      return null;
    }

    const count = Number(value);
    return Number.isFinite(count) && count >= 0 ? count : null;
  } catch {
    return null;
  }
}

export function writeStoredProductSkeletonCount(
  queryKey: readonly unknown[],
  count: number,
): void {
  if (typeof window === "undefined" || count < 0) {
    return;
  }

  try {
    sessionStorage.setItem(storageKey(queryKey), String(count));
  } catch {
    // Ignore quota / private mode errors.
  }
}

type ResolveProductSkeletonCountOptions = {
  queryClient: QueryClient;
  queryKey: readonly unknown[];
  products?: Product[];
  limit?: number;
  fallbackCount?: number;
};

/** Match skeleton placeholders to the catalog size we expect for this query. */
export function resolveProductSkeletonCount({
  queryClient,
  queryKey,
  products,
  limit,
  fallbackCount,
}: ResolveProductSkeletonCountOptions): number {
  const cachedCount = queryClient.getQueryData<Product[]>(queryKey)?.length;
  const storedCount = readStoredProductSkeletonCount(queryKey);
  const knownCount = products?.length ?? cachedCount ?? storedCount ?? fallbackCount ?? 0;

  if (limit !== undefined) {
    return Math.min(limit, knownCount);
  }

  return knownCount;
}
