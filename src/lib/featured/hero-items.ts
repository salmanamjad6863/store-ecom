import { resolveListingDisplayColor } from "@/lib/utils/product-colors";
import {
  FEATURED_HERO_PRODUCT_COUNT,
  type HomepageSettings,
} from "@/types/store-settings";
import type { Product } from "@/types/product";
import type { ProductColor } from "@/types/product-color";

export type FeaturedHeroItem = {
  product: Product;
  colorId?: string;
};

export type FeaturedHeroSlot = {
  productId: string;
  colorId: string;
};

export function emptyFeaturedHeroSlots(): FeaturedHeroSlot[] {
  return Array.from({ length: FEATURED_HERO_PRODUCT_COUNT }, () => ({
    productId: "",
    colorId: "",
  }));
}

export function getAvailableHeroColors(product: Product): ProductColor[] {
  return product.colors.filter((color) => (color.totalQuantity ?? 0) > 0);
}

export function getDefaultHeroColorId(product: Product): string {
  const available = getAvailableHeroColors(product);
  if (available.length > 0) {
    return available[0].colorId;
  }

  return product.colors[0]?.colorId ?? "";
}

export function resolveHeroColorId(product: Product, preferredColorId?: string): string | undefined {
  const available = getAvailableHeroColors(product);
  if (available.length === 0) {
    return product.colors[0]?.colorId;
  }

  if (preferredColorId && available.some((color) => color.colorId === preferredColorId)) {
    return preferredColorId;
  }

  return available[0]?.colorId;
}

export function slotsFromHomepageSettings(settings: HomepageSettings): FeaturedHeroSlot[] {
  const slots = emptyFeaturedHeroSlots();

  settings.featuredProductIds.forEach((productId, index) => {
    slots[index] = {
      productId,
      colorId: settings.featuredColorIds[index] ?? "",
    };
  });

  return slots;
}

export function homepageSettingsFromSlots(slots: FeaturedHeroSlot[]): HomepageSettings {
  const normalized = slots.slice(0, FEATURED_HERO_PRODUCT_COUNT);

  while (normalized.length < FEATURED_HERO_PRODUCT_COUNT) {
    normalized.push({ productId: "", colorId: "" });
  }

  return {
    featuredProductIds: normalized.map((slot) => slot.productId),
    featuredColorIds: normalized.map((slot) => slot.colorId),
  };
}

export function resolveFeaturedHeroItems(
  products: Product[],
  settings: HomepageSettings,
): FeaturedHeroItem[] {
  const configuredSlots = slotsFromHomepageSettings(settings).filter((slot) => slot.productId);
  const visibleProducts = products.filter((product) => !product.hidden);

  if (configuredSlots.length === 0) {
    return visibleProducts.slice(0, FEATURED_HERO_PRODUCT_COUNT).map((product) => ({
      product,
      colorId: resolveListingDisplayColor(product).colorId,
    }));
  }

  const byId = new Map(visibleProducts.map((product) => [product.id, product]));

  return configuredSlots
    .flatMap((slot) => {
      const product = byId.get(slot.productId);
      if (!product) {
        return [];
      }

      return [
        {
          product,
          colorId: resolveHeroColorId(product, slot.colorId || undefined),
        },
      ];
    })
    .slice(0, FEATURED_HERO_PRODUCT_COUNT);
}
