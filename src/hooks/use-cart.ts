"use client";

import { useCartStore, selectCartItemCount } from "@/stores/cart-store";

export function useCart() {
  const items = useCartStore((state) => state.items);
  const itemCount = useCartStore(selectCartItemCount);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);

  return {
    items,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
  };
}
