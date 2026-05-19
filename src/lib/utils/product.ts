import type { Product } from "@/types/product";

export function computeSalePriceFromPercent(priceMinor: number, percentOff: number): number {
  const clamped = Math.min(99, Math.max(1, Math.round(percentOff)));
  return Math.max(0, Math.round(priceMinor * (1 - clamped / 100)));
}

export function getProductSalePercent(product: Product): number | null {
  if (!product.onSale) {
    return null;
  }

  if (product.salePercent !== undefined && product.salePercent > 0) {
    return Math.min(99, Math.max(1, Math.round(product.salePercent)));
  }

  if (
    product.salePrice !== undefined &&
    product.price > 0 &&
    product.salePrice < product.price
  ) {
    return Math.round(((product.price - product.salePrice) / product.price) * 100);
  }

  return null;
}

export function formatSalePercentLabel(percent: number): string {
  return `${percent}% OFF`;
}

export function getProductDisplayPrice(product: Product): {
  amount: number;
  compareAt?: number;
} {
  if (product.onSale && product.salePrice !== undefined) {
    return { amount: product.salePrice, compareAt: product.price };
  }

  return { amount: product.price };
}

export function isProductSoldOut(product: Product): boolean {
  return product.quantity <= 0;
}

export type ProductStatusBadge = {
  variant: "default" | "sale" | "soldOut";
  label: string;
};

/** Admin table / dashboard labels for catalog visibility and stock. */
export function getProductStatusBadges(product: Product): ProductStatusBadge[] {
  const badges: ProductStatusBadge[] = [];

  if (product.hidden) {
    badges.push({ variant: "default", label: "Hidden" });
  }

  if (isProductSoldOut(product)) {
    badges.push({ variant: "soldOut", label: "Sold out" });
  } else if (product.onSale) {
    const percent = getProductSalePercent(product);
    badges.push({
      variant: "sale",
      label: percent !== null ? formatSalePercentLabel(percent) : "Sale",
    });
  }

  if (!product.hidden && !isProductSoldOut(product) && !product.onSale) {
    badges.push({ variant: "default", label: "Active" });
  }

  return badges;
}
