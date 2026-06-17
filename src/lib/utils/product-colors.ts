import type { Product, ProductWithVariants } from "@/types/product";
import type { ProductColor } from "@/types/product-color";
import type { ProductVariant } from "@/types/product-variant";

import { isProductSoldOut } from "./product";
import { getProductTotalStock, getUniqueModelIdsFromVariants } from "./variant";

export function getColorById(product: Product, colorId: string): ProductColor | undefined {
  return product.colors.find((color) => color.colorId === colorId);
}

export function getVariantsForColor(
  variants: ProductVariant[],
  colorId: string,
): ProductVariant[] {
  return variants.filter((variant) => variant.colorId === colorId);
}

export function isColorSoldOut(color: ProductColor, variants: ProductVariant[]): boolean {
  const colorVariants = getVariantsForColor(variants, color.colorId);
  if (colorVariants.length > 0) {
    return getProductTotalStock(colorVariants) <= 0;
  }
  return (color.totalQuantity ?? 0) <= 0;
}

export function resolveFeaturedColor(product: Product): ProductColor {
  const featured = product.shopFeaturedColorId
    ? getColorById(product, product.shopFeaturedColorId)
    : undefined;

  if (featured) {
    return featured;
  }

  return product.colors[0];
}

export function resolveShopDisplayColor(
  product: ProductWithVariants,
  preferredColorId?: string,
): ProductColor {
  const tryOrder = [
    preferredColorId,
    product.shopFeaturedColorId,
    product.colors[0]?.colorId,
  ].filter(Boolean) as string[];

  for (const colorId of tryOrder) {
    const color = getColorById(product, colorId);
    if (color && !isColorSoldOut(color, product.variants)) {
      return color;
    }
  }

  const inStock = product.colors.find(
    (color) => !isColorSoldOut(color, product.variants),
  );
  return inStock ?? product.colors[0];
}

export function resolveListingDisplayColor(
  product: Product,
  preferredColorId?: string,
): ProductColor {
  const tryOrder = [
    preferredColorId,
    product.shopFeaturedColorId,
    product.colors[0]?.colorId,
  ].filter(Boolean) as string[];

  for (const colorId of tryOrder) {
    const color = getColorById(product, colorId);
    if (color && (color.totalQuantity ?? 0) > 0) {
      return color;
    }
  }

  const inStock = product.colors.find((color) => (color.totalQuantity ?? 0) > 0);
  return inStock ?? product.colors[0];
}

/** Honors an explicit color choice (e.g. cart line) without stock-based fallback. */
export function resolvePreferredColor(
  product: Product,
  preferredColorId?: string,
): ProductColor {
  if (preferredColorId) {
    const preferred = getColorById(product, preferredColorId);
    if (preferred) {
      return preferred;
    }
  }

  return resolveListingDisplayColor(product, preferredColorId);
}

export function getColorHeroImage(
  color: ProductColor,
  variants: ProductVariant[],
): string {
  if (color.heroImage) {
    return color.heroImage;
  }

  const colorVariants = getVariantsForColor(variants, color.colorId);
  const variantImage = colorVariants.find((variant) => variant.images[0])?.images[0];
  if (variantImage) {
    return variantImage;
  }

  return color.images[0] ?? "";
}

export function buildColorDenormalizedFields(
  colorId: string,
  variants: Array<{ modelId: string; quantity: number; images: string[] }>,
) {
  return {
    availableModelIds: getUniqueModelIdsFromVariants(variants),
    heroImage: variants.find((variant) => variant.images[0])?.images[0] ?? null,
    totalQuantity: getProductTotalStock(variants),
  };
}

export function buildDesignDenormalizedFields(
  colors: ProductColor[],
  variants: ProductVariant[],
  defaultVariantId?: string,
) {
  const allModelIds = new Set<string>();
  let totalQuantity = 0;
  let heroImage: string | null = null;

  for (const color of colors) {
    const colorVariants = getVariantsForColor(variants, color.colorId);
    for (const modelId of getUniqueModelIdsFromVariants(colorVariants)) {
      allModelIds.add(modelId);
    }
    totalQuantity += getProductTotalStock(colorVariants);
    if (!heroImage) {
      heroImage = getColorHeroImage(color, variants) || null;
    }
  }

  const featured = colors.find((c) => c.colorId === colors[0]?.colorId) ?? colors[0];
  const featuredVariants = getVariantsForColor(variants, featured?.colorId ?? "");
  const defaultVariant =
    variants.find((variant) => variant.id === defaultVariantId) ??
    featuredVariants.find((variant) => variant.quantity > 0) ??
    featuredVariants[0];

  return {
    hasVariants: variants.length > 0,
    availableModelIds: Array.from(allModelIds),
    defaultVariantId: defaultVariant?.id ?? null,
    heroImage: heroImage ?? defaultVariant?.images[0] ?? null,
    totalQuantity,
    quantity: totalQuantity,
  };
}

export function colorOptionsFromProduct(product: ProductWithVariants): import("@/types/product-variant").DesignColorOption[] {
  return product.colors.map((color) => ({
    colorId: color.colorId,
    colorName: color.colorName,
    colorHex: color.colorHex,
    heroImage: getColorHeroImage(color, product.variants),
    inStock: !isColorSoldOut(color, product.variants),
  }));
}

export function isDesignSoldOut(product: Product, variants: ProductVariant[]): boolean {
  if (product.hasVariants) {
    return variants.every((variant) => variant.quantity <= 0) || variants.length === 0;
  }
  return isProductSoldOut(product);
}
