import { getCartLineKey } from "@/types/cart";
import type { CartItem } from "@/types/cart";
import type { ProductWithVariants } from "@/types/product";
import { getColorById } from "@/lib/utils/product-colors";
import { getProductDisplayPrice, isProductSoldOut } from "@/lib/utils/product";
import {
  formatVariantLabel,
  getVariantDisplayPrice,
  isVariantSoldOut,
  productHasVariants,
} from "@/lib/utils/variant";

export type CartSyncIssue = {
  lineKey: string;
  name: string;
  type: "removed" | "sold_out" | "price_changed" | "quantity_reduced";
  message: string;
};

export type CartSyncResult = {
  issues: CartSyncIssue[];
  hasBlockingIssues: boolean;
};

function getUnitPrice(product: ProductWithVariants, variantId: string): number {
  if (productHasVariants(product)) {
    const variant = product.variants.find((entry) => entry.id === variantId);
    if (variant) {
      return getVariantDisplayPrice(product, variant).amount;
    }
  }

  return getProductDisplayPrice(product).amount;
}

export function buildProductMap(
  products: ProductWithVariants[],
): Map<string, ProductWithVariants> {
  return new Map(products.map((product) => [product.id, product]));
}

/** Apply latest catalog data to cart items; returns user-visible issues. */
export function syncCartItems(
  items: CartItem[],
  productsById: Map<string, ProductWithVariants>,
): { nextItems: CartItem[]; result: CartSyncResult } {
  const issues: CartSyncIssue[] = [];
  const nextItems: CartItem[] = [];

  for (const item of items) {
    const lineKey = getCartLineKey(item.productId, item.colorId, item.variantId);
    const product = productsById.get(item.productId);

    if (!product || product.hidden) {
      issues.push({
        lineKey,
        name: item.name,
        type: "removed",
        message: `${item.name} is no longer available and was removed from your cart.`,
      });
      continue;
    }

    if (productHasVariants(product)) {
      const variant = product.variants.find((entry) => entry.id === item.variantId);

      if (!variant) {
        issues.push({
          lineKey,
          name: item.name,
          type: "removed",
          message: `${item.name} (${item.modelName ?? "variant"}) is no longer available and was removed from your cart.`,
        });
        continue;
      }

      const color = getColorById(product, item.colorId || variant.colorId);
      const colorName = color?.colorName ?? item.colorName ?? "Color";
      const label = formatVariantLabel(colorName, variant);

      if (isVariantSoldOut(variant)) {
        issues.push({
          lineKey,
          name: item.name,
          type: "sold_out",
          message: `${item.name} (${label}) is sold out and was removed from your cart.`,
        });
        continue;
      }

      const unitPrice = getUnitPrice(product, variant.id);
      const maxQuantity = variant.quantity;
      let quantity = item.quantity;

      if (unitPrice !== item.unitPrice) {
        issues.push({
          lineKey,
          name: item.name,
          type: "price_changed",
          message: `Price updated for ${item.name} (${label}).`,
        });
      }

      if (quantity > maxQuantity) {
        quantity = maxQuantity;
        issues.push({
          lineKey,
          name: item.name,
          type: "quantity_reduced",
          message: `Only ${maxQuantity} of ${item.name} (${label}) available — quantity adjusted.`,
        });
      }

      nextItems.push({
        productId: product.id,
        colorId: variant.colorId || item.colorId,
        variantId: variant.id,
        slug: product.slug,
        name: product.theme || product.name,
        modelName: variant.modelName,
        colorName,
        image:
          color?.heroImage ??
          color?.images[0] ??
          variant.images[0] ??
          product.heroImage ??
          product.images[0] ??
          "",
        unitPrice,
        quantity,
        maxQuantity,
      });

      continue;
    }

    if (isProductSoldOut(product)) {
      issues.push({
        lineKey,
        name: product.theme || product.name,
        type: "sold_out",
        message: `${product.name} is sold out and was removed from your cart.`,
      });
      continue;
    }

    const colorId = item.colorId || product.colors[0]?.colorId || "default";
    const color = getColorById(product, colorId);
    const unitPrice = getUnitPrice(product, "");
    const maxQuantity = product.quantity;
    let quantity = item.quantity;

    if (unitPrice !== item.unitPrice) {
      issues.push({
        lineKey,
        name: product.theme || product.name,
        type: "price_changed",
        message: `Price updated for ${product.name}.`,
      });
    }

    if (quantity > maxQuantity) {
      quantity = maxQuantity;
      issues.push({
        lineKey,
        name: product.theme || product.name,
        type: "quantity_reduced",
        message: `Only ${maxQuantity} of ${product.name} available — quantity adjusted.`,
      });
    }

    nextItems.push({
      productId: product.id,
      colorId,
      variantId: "",
      slug: product.slug,
      name: product.theme || product.name,
      colorName: color?.colorName,
      image: color?.heroImage ?? product.heroImage ?? product.images[0] ?? "",
      unitPrice,
      quantity,
      maxQuantity,
    });
  }

  const hasBlockingIssues = issues.some(
    (issue) => issue.type === "removed" || issue.type === "sold_out",
  );

  return { nextItems, result: { issues, hasBlockingIssues } };
}
