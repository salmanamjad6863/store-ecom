import { getProductDisplayPrice, isProductSoldOut } from "@/lib/utils/product";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

export type CartSyncIssue = {
  productId: string;
  name: string;
  type: "removed" | "sold_out" | "price_changed" | "quantity_reduced";
  message: string;
};

export type CartSyncResult = {
  issues: CartSyncIssue[];
  hasBlockingIssues: boolean;
};

function getUnitPrice(product: Product): number {
  return getProductDisplayPrice(product).amount;
}

export function buildProductMap(products: Product[]): Map<string, Product> {
  return new Map(products.map((product) => [product.id, product]));
}

/** Apply latest catalog data to cart items; returns user-visible issues. */
export function syncCartItems(
  items: CartItem[],
  productsById: Map<string, Product>,
): { nextItems: CartItem[]; result: CartSyncResult } {
  const issues: CartSyncIssue[] = [];
  const nextItems: CartItem[] = [];

  for (const item of items) {
    const product = productsById.get(item.productId);

    if (!product || product.hidden) {
      issues.push({
        productId: item.productId,
        name: item.name,
        type: "removed",
        message: `${item.name} is no longer available and was removed from your cart.`,
      });
      continue;
    }

    if (isProductSoldOut(product)) {
      issues.push({
        productId: item.productId,
        name: product.name,
        type: "sold_out",
        message: `${product.name} is sold out and was removed from your cart.`,
      });
      continue;
    }

    const unitPrice = getUnitPrice(product);
    const maxQuantity = product.quantity;
    let quantity = item.quantity;

    if (unitPrice !== item.unitPrice) {
      issues.push({
        productId: item.productId,
        name: product.name,
        type: "price_changed",
        message: `Price updated for ${product.name}.`,
      });
    }

    if (quantity > maxQuantity) {
      quantity = maxQuantity;
      issues.push({
        productId: item.productId,
        name: product.name,
        type: "quantity_reduced",
        message: `Only ${maxQuantity} of ${product.name} available — quantity adjusted.`,
      });
    }

    nextItems.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
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
