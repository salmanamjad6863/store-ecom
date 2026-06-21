"use client";

import { useCartStore, selectCartItemCount, selectCartSubtotal } from "@/stores/cart-store";

export function useCart() {
  const items = useCartStore((state) => state.items);
  const itemCount = useCartStore(selectCartItemCount);
  const subtotal = useCartStore(selectCartSubtotal);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  return {
    items,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    /** @deprecated Prefer `subtotal` — kept for callers that expect a getter. */
    getSubtotal: () => subtotal,
  };
}
