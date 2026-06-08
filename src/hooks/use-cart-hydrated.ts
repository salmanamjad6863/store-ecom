"use client";

import { useEffect, useState } from "react";

import { useCartStore } from "@/stores/cart-store";

/** True once Zustand has restored the cart from localStorage (client only). */
export function useCartHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useCartStore.persist;

    if (!persist) {
      setHydrated(true);
      return;
    }

    if (persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    return persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}
