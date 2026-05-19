"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CartItem, CartState } from "@/types/cart";
import type { Product } from "@/types/product";

function getUnitPrice(product: Product): number {
  if (product.onSale && product.salePrice !== undefined) {
    return product.salePrice;
  }

  return product.price;
}

function clampQuantity(quantity: number, maxQuantity: number): number {
  if (maxQuantity <= 0) {
    return 0;
  }

  return Math.min(Math.max(quantity, 1), maxQuantity);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const maxQuantity = item.maxQuantity;

        if (maxQuantity <= 0) {
          return;
        }

        const quantity = clampQuantity(item.quantity ?? 1, maxQuantity);

        set((state) => {
          const existing = state.items.find(
            (cartItem) => cartItem.productId === item.productId,
          );

          if (existing) {
            const nextQuantity = clampQuantity(
              existing.quantity + quantity,
              existing.maxQuantity,
            );

            return {
              items: state.items.map((cartItem) =>
                cartItem.productId === item.productId
                  ? { ...cartItem, quantity: nextQuantity }
                  : cartItem,
              ),
            };
          }

          const newItem: CartItem = {
            productId: item.productId,
            slug: item.slug,
            name: item.name,
            image: item.image,
            unitPrice: item.unitPrice,
            quantity,
            maxQuantity,
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: clampQuantity(quantity, item.maxQuantity) }
              : item,
          ),
        }));
      },

      replaceItems: (items) => set({ items }),

      clearCart: () => set({ items: [] }),

      getItemCount: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    }),
    {
      name: "store-ecom-cart",
    },
  ),
);

export function addProductToCart(product: Product, quantity = 1): void {
  useCartStore.getState().addItem({
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0] ?? "",
    unitPrice: getUnitPrice(product),
    maxQuantity: product.quantity,
    quantity,
  });
}

export const selectCartItemCount = (state: CartState) =>
  state.items.reduce((total, item) => total + item.quantity, 0);
