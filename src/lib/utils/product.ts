import type { Product } from "@/types/product";

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
