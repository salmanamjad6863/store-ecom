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
import { queryKeys } from "@/lib/queries/keys";
import { prefetchProductById } from "@/lib/queries/prefetch-product";
import { fetchProductWithVariantsById } from "@/lib/queries/products";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

type PreviewOptions = {
  initialColorId?: string;
  initialVariantId?: string;
  initialImage?: string;
};

type PreviewState = {
  product: Product;
  initialColorId?: string;
  initialVariantId?: string;
  initialImage?: string;
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
  const [isOpen, setIsOpen] = useState(false);

  const openPreview = useCallback((product: Product, options?: PreviewOptions) => {
    setPreview({
      product,
      initialColorId: options?.initialColorId,
      initialVariantId: options?.initialVariantId,
      initialImage: options?.initialImage,
    });
    setIsOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handlePreviewExited = useCallback(() => {
    setPreview(null);
  }, []);

  const openPreviewFromCartItem = useCallback(
    async (item: CartItem) => {
      const cached = queryClient.getQueryData<Awaited<ReturnType<typeof fetchProductWithVariantsById>>>(
        queryKeys.products.detailWithVariantsById(item.productId),
      );

      let product = cached ?? null;

      if (!product) {
        await prefetchProductById(queryClient, item.productId);
        product = await fetchProductWithVariantsById(item.productId);
      }

      if (!product) {
        return;
      }

      openPreview(product, {
        initialColorId: item.colorId,
        initialVariantId: item.variantId || undefined,
        initialImage: item.image,
      });
    },
    [queryClient, openPreview],
  );

  const value = useMemo(
    () => ({
      isOpen: isOpen && Boolean(preview),
      openPreview,
      openPreviewFromCartItem,
      closePreview,
    }),
    [isOpen, preview, openPreview, openPreviewFromCartItem, closePreview],
  );

  return (
    <ProductPreviewContext.Provider value={value}>
      {children}
      {preview && typeof document !== "undefined"
        ? createPortal(
            <ProductQuickPreview
              key={`${preview.product.id}:${preview.initialColorId ?? ""}:${preview.initialVariantId ?? ""}:${preview.initialImage ?? ""}`}
              open={isOpen}
              product={preview.product}
              initialColorId={preview.initialColorId}
              initialVariantId={preview.initialVariantId}
              initialImage={preview.initialImage}
              onClose={closePreview}
              onExited={handlePreviewExited}
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
