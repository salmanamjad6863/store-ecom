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

export type ProductPreviewOptions = {
  initialColorId?: string;
  initialVariantId?: string;
  initialImage?: string;
  initialModelId?: string;
};

type PreviewState = {
  product: Product;
  initialColorId?: string;
  initialVariantId?: string;
  initialImage?: string;
  initialModelId?: string;
};

type ProductPreviewContextValue = {
  isOpen: boolean;
  openPreview: (product: Product, options?: ProductPreviewOptions) => void;
  openPreviewFromCartItem: (item: CartItem) => Promise<void>;
  closePreview: () => void;
};

const ProductPreviewContext = createContext<ProductPreviewContextValue | null>(null);

export function ProductPreviewProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openPreview = useCallback<ProductPreviewContextValue["openPreview"]>(
    (product, options) => {
      const cached = queryClient.getQueryData(
        queryKeys.products.detailWithVariantsById(product.id),
      );
      if (!cached && product.hasVariants) {
        void prefetchProductById(queryClient, product.id);
      }

      setPreview({
        product,
        initialColorId: options?.initialColorId,
        initialVariantId: options?.initialVariantId,
        initialImage: options?.initialImage,
        initialModelId: options?.initialModelId,
      });
      setIsOpen(true);
    },
    [queryClient],
  );

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
    (): ProductPreviewContextValue => ({
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
              key={`${preview.product.id}:${preview.initialColorId ?? ""}:${preview.initialVariantId ?? ""}:${preview.initialModelId ?? ""}:${preview.initialImage ?? ""}`}
              open={isOpen}
              product={preview.product}
              initialColorId={preview.initialColorId}
              initialVariantId={preview.initialVariantId}
              initialImage={preview.initialImage}
              initialModelId={preview.initialModelId}
              onClose={closePreview}
              onExited={handlePreviewExited}
            />,
            document.body,
          )
        : null}
    </ProductPreviewContext.Provider>
  );
}

export function useProductPreview(): ProductPreviewContextValue {
  const context = useContext(ProductPreviewContext);

  if (!context) {
    throw new Error("useProductPreview must be used within ProductPreviewProvider");
  }

  return context;
}
