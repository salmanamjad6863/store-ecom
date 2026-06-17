"use client";

import { useEffect, useState } from "react";

import { useCartStore } from "@/stores/cart-store";

function readHydrated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const persist = useCartStore.persist;
  return persist?.hasHydrated() ?? true;
}

/** True once Zustand has restored the cart from localStorage (client only). */
export function useCartHydrated(): boolean {
  const [hydrated, setHydrated] = useState(readHydrated);

  useEffect(() => {
    if (hydrated) {
      return;
    }

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
  }, [hydrated]);

  return hydrated;
}
