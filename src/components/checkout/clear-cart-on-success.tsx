"use client";

import { useEffect } from "react";

import { useCart } from "@/hooks/use-cart";

/** Clears the cart once after a successful checkout (avoids empty-cart redirect on /checkout). */
export function ClearCartOnSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
