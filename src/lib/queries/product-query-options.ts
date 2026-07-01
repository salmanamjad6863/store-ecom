/** Shared React Query cache settings for storefront product data. */
export const PRODUCT_STALE_TIME_MS = 15 * 60 * 1000;
export const PRODUCT_GC_TIME_MS = 30 * 60 * 1000;

export const productQueryDefaults = {
  staleTime: PRODUCT_STALE_TIME_MS,
  gcTime: PRODUCT_GC_TIME_MS,
  refetchOnWindowFocus: false,
} as const;
