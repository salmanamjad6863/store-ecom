import { getProductDisplayPrice, isProductSoldOut } from "@/lib/utils/product";
import type { Product } from "@/types/product";

/** Matches ProductCard type line. */
export const PRODUCT_CARD_TYPE_CLASSES =
  "truncate text-[10px] uppercase tracking-wide sm:text-xs";

/** Matches ProductCard title — always reserves two lines (line-clamp-2). */
export const PRODUCT_CARD_TITLE_CLASSES = "line-clamp-2 text-sm leading-snug sm:text-lg";

/** Matches ProductCard price row. */
export const PRODUCT_CARD_PRICE_CLASSES = "text-xs sm:text-base";

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

  const { compareAt } = getProductDisplayPrice(product);
  const soldOut = isProductSoldOut(product);

  return {
    showBadge: soldOut || product.onSale,
    showSalePrice: compareAt !== undefined && compareAt > getProductDisplayPrice(product).amount,
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
