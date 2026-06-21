"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useProducts } from "@/hooks/use-products";
import { queryKeys } from "@/lib/queries/keys";
import { productQueryDefaults } from "@/lib/queries/product-query-options";
import { fetchProductWithVariantsById } from "@/lib/queries/products";

/** Backfill variant cache on client navigations that skipped SSR hydration. */
export function CatalogVariantWarmup() {
  const queryClient = useQueryClient();
  const { data: products } = useProducts();

  useEffect(() => {
    if (!products?.length) {
      return;
    }

    const warm = () => {
      for (const product of products) {
        if (!product.hasVariants) {
          continue;
        }

        const key = queryKeys.products.detailWithVariantsById(product.id);
        if (queryClient.getQueryData(key)) {
          continue;
        }

        void queryClient.prefetchQuery({
          queryKey: key,
          queryFn: () => fetchProductWithVariantsById(product.id),
          ...productQueryDefaults,
        });
      }
    };

    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(warm, { timeout: 2000 });
    } else {
      window.setTimeout(warm, 300);
    }
  }, [products, queryClient]);

  return null;
}
