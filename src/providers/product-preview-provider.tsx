"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { ProductQuickPreview } from "@/components/shop/product-quick-preview";
import { prefetchProductBySlug } from "@/lib/queries/prefetch-product";
import { fetchProductBySlug } from "@/lib/queries/products";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

type PreviewOptions = {
  initialColorId?: string;
  initialVariantId?: string;
};

type PreviewState = {
  product: Product;
  initialColorId?: string;
  initialVariantId?: string;
};

type ProductPreviewContextValue = {
  isOpen: boolean;
  openPreview: (product: Product, options?: PreviewOptions) => void;
  openPreviewFromCartItem: (item: CartItem) => Promise<void>;
  closePreview: () => void;
};

const ProductPreviewContext = createContext<ProductPreviewContextValue | null>(null);

export function ProductPreviewProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const openPreview = useCallback((product: Product, options?: PreviewOptions) => {
    setPreview({
      product,
      initialColorId: options?.initialColorId,
      initialVariantId: options?.initialVariantId,
    });
  }, []);

  const closePreview = useCallback(() => {
    setPreview(null);
  }, []);

  const openPreviewFromCartItem = useCallback(
    async (item: CartItem) => {
      await prefetchProductBySlug(queryClient, item.slug);
      const product = await fetchProductBySlug(item.slug);

      if (!product) {
        return;
      }

      openPreview(product, {
        initialColorId: item.colorId,
        initialVariantId: item.variantId || undefined,
      });
    },
    [queryClient, openPreview],
  );

  const value = useMemo(
    () => ({
      isOpen: Boolean(preview),
      openPreview,
      openPreviewFromCartItem,
      closePreview,
    }),
    [preview, openPreview, openPreviewFromCartItem, closePreview],
  );

  return (
    <ProductPreviewContext.Provider value={value}>
      {children}
      {preview && typeof document !== "undefined"
        ? createPortal(
            <ProductQuickPreview
              open
              product={preview.product}
              initialColorId={preview.initialColorId}
              initialVariantId={preview.initialVariantId}
              onClose={closePreview}
            />,
            document.body,
          )
        : null}
    </ProductPreviewContext.Provider>
  );
}

export function useProductPreview() {
  const context = useContext(ProductPreviewContext);

  if (!context) {
    throw new Error("useProductPreview must be used within ProductPreviewProvider");
  }

  return context;
}
