import { getColorById } from "@/lib/utils/product-colors";
import type { OrderItem } from "@/types/order";
import type { Product } from "@/types/product";

function isWeakLabel(value?: string): boolean {
  if (!value?.trim()) {
    return true;
  }

  return /^\d+$/.test(value.trim());
}

export type OrderItemDisplay = {
  title: string;
  variantLine: string | null;
  colorName?: string;
  modelName?: string;
};

/** Resolve storefront-friendly labels; enriches from catalog when order snapshot is incomplete. */
export function resolveOrderItemDisplay(
  item: OrderItem,
  product?: Product | null,
): OrderItemDisplay {
  const catalogColor =
    product && item.colorId ? getColorById(product, item.colorId) : undefined;

  const title =
    product?.theme?.trim() ||
    (!isWeakLabel(item.name) ? item.name.trim() : "") ||
    product?.name?.trim() ||
    item.slug;

  const colorName =
    (!isWeakLabel(item.colorName) ? item.colorName?.trim() : undefined) ||
    catalogColor?.colorName;

  const modelName = item.modelName?.trim() || undefined;
  const variantParts = [colorName, modelName].filter(Boolean);

  return {
    title,
    colorName,
    modelName,
    variantLine: variantParts.length > 0 ? variantParts.join(" · ") : null,
  };
}
