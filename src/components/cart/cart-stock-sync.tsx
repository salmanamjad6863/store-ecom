"use client";

import { useEffect, useRef } from "react";

import { useRevalidateCart } from "@/hooks/use-revalidate-cart";
import { useCartStore } from "@/stores/cart-store";

/** Keep cart prices and stock in sync with Firestore. */
export function CartStockSync() {
  const { revalidate } = useRevalidateCart();
  const hasSyncedOnHydrate = useRef(false);

  useEffect(() => {
    const syncFromCatalog = () => {
      if (hasSyncedOnHydrate.current) {
        return;
      }

      const items = useCartStore.getState().items;
      if (items.length === 0) {
        return;
      }

      hasSyncedOnHydrate.current = true;
      void revalidate();
    };

    if (useCartStore.persist.hasHydrated()) {
      syncFromCatalog();
      return;
    }

    return useCartStore.persist.onFinishHydration(syncFromCatalog);
  }, [revalidate]);

  useEffect(() => {
    const syncIfNeeded = () => {
      if (useCartStore.getState().items.length === 0) {
        return;
      }

      void revalidate();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncIfNeeded();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [revalidate]);

  return null;
}
