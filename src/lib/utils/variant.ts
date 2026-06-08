import type { Product, ProductWithVariants } from "@/types/product";
import type { ProductVariant } from "@/types/product-variant";

import { getProductDisplayPrice } from "./product";

export function productHasVariants(product: Product): boolean {
  return product.hasVariants === true;
}

export function getVariantDisplayPrice(
  product: Product,
  variant?: ProductVariant | null,
): { amount: number; compareAt?: number } {
  const variantPrice = variant?.price;
  const hasOwnVariantPrice =
    typeof variantPrice === "number" &&
    Number.isFinite(variantPrice) &&
    variantPrice > 0;

  if (hasOwnVariantPrice) {
    if (product.onSale && product.salePrice !== undefined) {
      const ratio = product.salePrice / product.price;
      const saleAmount = Math.round(variantPrice * ratio);
      return { amount: saleAmount, compareAt: variantPrice };
    }
    return { amount: variantPrice };
  }

  return getProductDisplayPrice(product);
}

/** Unit price stored on cart lines (minor units, same as product.price). */
export function resolveCartUnitPrice(
  product: Product,
  variant?: ProductVariant | null,
): number {
  return getVariantDisplayPrice(product, variant).amount;
}

export function isVariantSoldOut(variant: ProductVariant): boolean {
  return variant.quantity <= 0;
}

export function getProductTotalStock(
  variants: Array<{ quantity: number }>,
): number {
  return variants.reduce((total, variant) => total + variant.quantity, 0);
}

export function isProductSoldOutWithVariants(
  product: Product,
  variants: ProductVariant[],
): boolean {
  if (!productHasVariants(product)) {
    return product.quantity <= 0;
  }

  if (variants.length === 0) {
    return true;
  }

  return getProductTotalStock(variants) <= 0;
}

export function getUniqueModelIdsFromVariants(
  variants: Array<{ modelId: string }>,
): string[] {
  return [...new Set(variants.map((variant) => variant.modelId))];
}

export function getVariantByModel(
  variants: ProductVariant[],
  modelId: string,
  colorId?: string,
): ProductVariant | undefined {
  if (colorId) {
    return variants.find(
      (variant) => variant.modelId === modelId && variant.colorId === colorId,
    );
  }
  return variants.find((variant) => variant.modelId === modelId);
}

export function resolveDefaultVariant(
  product: Product,
  variants: ProductVariant[],
  colorId?: string,
): ProductVariant | undefined {
  const scoped = colorId
    ? variants.filter((variant) => variant.colorId === colorId)
    : variants;

  if (scoped.length === 0) {
    return undefined;
  }

  if (product.defaultVariantId) {
    const match = scoped.find((variant) => variant.id === product.defaultVariantId);
    if (match) {
      return match;
    }
  }

  const inStock = scoped.find((variant) => variant.quantity > 0);
  return inStock ?? scoped[0];
}

export function getProductHeroImage(product: Product, variants: ProductVariant[]): string {
  if (product.heroImage) {
    return product.heroImage;
  }

  const defaultVariant = resolveDefaultVariant(product, variants);
  if (defaultVariant?.images[0]) {
    return defaultVariant.images[0];
  }

  return product.images[0] ?? "";
}

export function buildVariantDenormalizedFields(
  variants: Array<{ id?: string; modelId: string; quantity: number; images: string[] }>,
  defaultVariantId?: string,
) {
  const availableModelIds = getUniqueModelIdsFromVariants(variants);
  const defaultVariant =
    variants.find((variant) => variant.id === defaultVariantId) ??
    variants.find((variant) => variant.quantity > 0) ??
    variants[0];

  return {
    hasVariants: variants.length > 0,
    availableModelIds,
    defaultVariantId: defaultVariant?.id ?? null,
    heroImage: defaultVariant?.images[0] ?? null,
    totalQuantity: getProductTotalStock(variants),
  };
}

export function formatVariantLabel(colorName: string, variant: ProductVariant): string {
  return `${variant.modelName} · ${colorName}`;
}

export function getProductListingQuantity(product: Product): number {
  if (productHasVariants(product)) {
    return product.totalQuantity ?? 0;
  }

  return product.quantity;
}

export function attachVariants(product: Product, variants: ProductVariant[]): ProductWithVariants {
  return { ...product, variants };
}

export type ModelSelection = {
  modelId: string;
  variant: ProductVariant;
};

export function resolveModelSelection(
  product: Product,
  variants: ProductVariant[],
  modelId?: string,
  colorId?: string,
): ModelSelection | null {
  const scoped = colorId
    ? variants.filter((variant) => variant.colorId === colorId)
    : variants;

  if (scoped.length === 0) {
    return null;
  }

  const defaultVariant = resolveDefaultVariant(product, scoped, colorId);
  if (!defaultVariant) {
    return null;
  }

  const resolvedModelId = modelId ?? defaultVariant.modelId;
  const variant =
    getVariantByModel(scoped, resolvedModelId, colorId) ?? defaultVariant;

  return { modelId: variant.modelId, variant };
}
