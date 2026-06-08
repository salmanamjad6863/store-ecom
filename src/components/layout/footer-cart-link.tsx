"use client";

import { useCartDrawer } from "@/providers/cart-drawer-provider";

export function FooterCartLink() {
  const { openCart } = useCartDrawer();

  return (
    <button
      type="button"
      onClick={openCart}
      className="text-sm text-cream/55 transition-colors hover:text-blush"
    >
      Cart
    </button>
  );
}
