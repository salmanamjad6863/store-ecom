"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getColorById } from "@/lib/utils/product-colors";
import {
  productHasVariants,
  resolveCartUnitPrice,
  resolveDefaultVariant,
} from "@/lib/utils/variant";
import { getCartLineKey, type CartItem, type CartState } from "@/types/cart";
import type { Product } from "@/types/product";
import type { ProductVariant } from "@/types/product-variant";

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
        const lineKey = getCartLineKey(item.productId, item.colorId, item.variantId);

        set((state) => {
          const existing = state.items.find(
            (cartItem) =>
              getCartLineKey(cartItem.productId, cartItem.colorId, cartItem.variantId) ===
              lineKey,
          );

          if (existing) {
            const nextQuantity = clampQuantity(
              existing.quantity + quantity,
              existing.maxQuantity,
            );

            return {
              items: state.items.map((cartItem) =>
                getCartLineKey(cartItem.productId, cartItem.colorId, cartItem.variantId) ===
                lineKey
                  ? {
                      ...cartItem,
                      quantity: nextQuantity,
                      unitPrice: item.unitPrice,
                      maxQuantity: item.maxQuantity,
                    }
                  : cartItem,
              ),
            };
          }

          const newItem: CartItem = {
            productId: item.productId,
            colorId: item.colorId,
            variantId: item.variantId,
            slug: item.slug,
            name: item.name,
            modelName: item.modelName,
            colorName: item.colorName,
            image: item.image,
            unitPrice: item.unitPrice,
            quantity,
            maxQuantity,
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (lineKey) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              getCartLineKey(item.productId, item.colorId, item.variantId) !== lineKey,
          ),
        }));
      },

      updateQuantity: (lineKey, quantity) => {
        if (quantity < 1) {
          get().removeItem(lineKey);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            getCartLineKey(item.productId, item.colorId, item.variantId) === lineKey
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
      version: 4,
      migrate: (persisted, version) => {
        const state = persisted as { items?: Array<Record<string, unknown>> };
        if (!state?.items) {
          return persisted as CartState;
        }

        return {
          ...state,
          items: state.items.map((item) => {
            const productId = String(item.productId ?? "");
            const variantId = String(item.variantId ?? "");
            const legacyColorId = item.colorId ? String(item.colorId) : "";

            return {
              productId,
              colorId: legacyColorId || (version < 3 ? "legacy" : ""),
              variantId,
              slug: String(item.slug ?? ""),
              name: String(item.name ?? ""),
              modelName: item.modelName ? String(item.modelName) : undefined,
              colorName: item.colorName ? String(item.colorName) : undefined,
              image: String(item.image ?? ""),
              unitPrice: Number(item.unitPrice ?? 0),
              quantity: Number(item.quantity ?? 1),
              maxQuantity: Number(item.maxQuantity ?? 1),
            };
          }),
        };
      },
    },
  ),
);

export function addVariantToCart(
  product: Product,
  variant: ProductVariant | undefined,
  quantity = 1,
  colorId?: string,
): void {
  if (productHasVariants(product) && !variant) {
    return;
  }

  const resolvedColorId =
    colorId ?? variant?.colorId ?? product.colors[0]?.colorId ?? "default";
  const color = getColorById(product, resolvedColorId);
  const unitPrice = resolveCartUnitPrice(product, variant);
  const maxQuantity = variant?.quantity ?? product.quantity;
  const image =
    variant?.images[0] ??
    color?.heroImage ??
    color?.images[0] ??
    product.heroImage ??
    product.images[0] ??
    "";

  useCartStore.getState().addItem({
    productId: product.id,
    colorId: resolvedColorId,
    variantId: variant?.id ?? "",
    slug: product.slug,
    name: product.name,
    modelName: variant?.modelName,
    colorName: color?.colorName,
    image,
    unitPrice,
    maxQuantity,
    quantity,
  });
}

export function addDefaultVariantToCart(
  product: Product,
  variants: ProductVariant[],
  colorId: string,
  quantity = 1,
): void {
  const defaultVariant = resolveDefaultVariant(product, variants, colorId);
  if (!defaultVariant) {
    return;
  }

  addVariantToCart(product, defaultVariant, quantity, colorId);
}

export const selectCartItemCount = (state: CartState) =>
  state.items.reduce((total, item) => total + item.quantity, 0);
