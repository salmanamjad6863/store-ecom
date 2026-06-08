"use client";

import { useEffect, useRef } from "react";

import { useRevalidateCart } from "@/hooks/use-revalidate-cart";
import { useCartStore } from "@/stores/cart-store";

/** Sync cart line prices from Firestore after Zustand rehydrates localStorage. */
export function CartPriceSync() {
  const { revalidate } = useRevalidateCart();
  const hasSynced = useRef(false);

  useEffect(() => {
    const syncFromCatalog = () => {
      if (hasSynced.current) {
        return;
      }

      const items = useCartStore.getState().items;
      if (items.length === 0) {
        return;
      }

      hasSynced.current = true;
      void revalidate();
    };

    if (useCartStore.persist.hasHydrated()) {
      syncFromCatalog();
      return;
    }

    return useCartStore.persist.onFinishHydration(syncFromCatalog);
  }, [revalidate]);

  return null;
}
