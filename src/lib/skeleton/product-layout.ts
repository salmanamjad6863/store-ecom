import { getProductDisplayPrice, isProductSoldOut } from "@/lib/utils/product";
import type { Product } from "@/types/product";

/** Matches ProductCard subtitle (below title). */
export const PRODUCT_CARD_TYPE_CLASSES =
  "truncate text-[10px] uppercase tracking-[0.14em] text-warm sm:text-[11px]";

/** Matches ProductCard title — centered, two lines max. */
export const PRODUCT_CARD_TITLE_CLASSES =
  "line-clamp-2 font-serif text-base font-semibold leading-snug text-deep sm:text-lg";

/** Matches ProductCard price row. */
export const PRODUCT_CARD_PRICE_CLASSES = "text-sm sm:text-base";

export function estimateDescriptionLines(description: string, charsPerLine = 64): number {
  if (!description.trim()) {
    return 2;
  }

  const lines = Math.ceil(description.length / charsPerLine);
  return Math.min(Math.max(lines, 2), 10);
}

export function getProductCardSkeletonFlags(product?: Product) {
  if (!product) {
    return {
      showBadge: false,
      showSalePrice: false,
    };
  }

  const { compareAt, amount } = getProductDisplayPrice(product);
  const soldOut = isProductSoldOut(product);

  return {
    showBadge: soldOut || product.onSale,
    showSalePrice: compareAt !== undefined && compareAt > amount,
  };
}

export function getProductDetailSkeletonLayout(product?: Product) {
  const description = product?.description ?? "";
  const imageCount = product?.images.length ?? 0;

  return {
    showThumbnails: imageCount > 1,
    thumbnailCount: imageCount > 1 ? Math.min(imageCount, 5) : 0,
    descriptionLines: estimateDescriptionLines(description),
    showBadge: product ? isProductSoldOut(product) || product.onSale : false,
    showSalePrice: product
      ? (() => {
          const { amount, compareAt } = getProductDisplayPrice(product);
          return compareAt !== undefined && compareAt > amount;
        })()
      : false,
    titleLines: product && product.name.length > 32 ? 2 : 1,
  };
}
