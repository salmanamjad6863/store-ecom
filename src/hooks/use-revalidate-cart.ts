"use client";

import { useCallback, useState } from "react";

import {
  buildProductMap,
  syncCartItems,
  type CartSyncResult,
} from "@/lib/cart/sync-cart";
import { fetchProductsWithVariantsByIds } from "@/lib/queries/products";
import { useCartStore } from "@/stores/cart-store";

export function useRevalidateCart() {
  const replaceItems = useCartStore((state) => state.replaceItems);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [lastResult, setLastResult] = useState<CartSyncResult | null>(null);

  const revalidate = useCallback(async (): Promise<CartSyncResult> => {
    const items = useCartStore.getState().items;

    if (items.length === 0) {
      const empty: CartSyncResult = { issues: [], hasBlockingIssues: false };
      setLastResult(empty);
      return empty;
    }

    setIsRevalidating(true);

    try {
      const productIds = items.map((item) => item.productId);
      const products = await fetchProductsWithVariantsByIds(productIds);
      const productsById = buildProductMap(products);
      const { nextItems, result } = syncCartItems(items, productsById);

      replaceItems(nextItems);
      setLastResult(result);

      return result;
    } finally {
      setIsRevalidating(false);
    }
  }, [replaceItems]);

  return { revalidate, isRevalidating, lastResult };
}
