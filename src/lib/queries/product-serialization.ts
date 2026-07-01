import type { Product, ProductWithVariants } from "@/types/product";

function reviveDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Normalize product dates after RSC / dehydrate JSON round-trips. */
export function reviveProduct<T extends Product>(product: T): T {
  return {
    ...product,
    createdAt: reviveDate(product.createdAt),
    updatedAt: reviveDate(product.updatedAt),
  };
}

export function reviveProducts(products: Product[]): Product[] {
  return products.map(reviveProduct);
}

export function reviveProductWithVariants(product: ProductWithVariants): ProductWithVariants {
  return {
    ...reviveProduct(product),
    variants: product.variants ?? [],
  };
}
