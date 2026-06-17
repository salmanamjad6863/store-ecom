import { fetchProductWithVariantsById } from "@/lib/queries/products";
import { getColorById } from "@/lib/utils/product-colors";
import { isVariantSoldOut, productHasVariants } from "@/lib/utils/variant";
import { addVariantToCart, useCartStore } from "@/stores/cart-store";
import { getCartLineKey } from "@/types/cart";
import type { Product } from "@/types/product";
import type { ProductVariant } from "@/types/product-variant";

export type AddToCartResult =
  | { ok: true }
  | { ok: false; message: string };

export async function addVariantToCartLive(
  product: Product,
  variant: ProductVariant | undefined,
  quantity = 1,
  colorId?: string,
): Promise<AddToCartResult> {
  const live = await fetchProductWithVariantsById(product.id);

  if (!live || live.hidden) {
    return { ok: false, message: "This product is no longer available." };
  }

  const resolvedColorId =
    colorId ?? variant?.colorId ?? live.colors[0]?.colorId ?? "default";

  if (productHasVariants(live)) {
    if (!variant) {
      return { ok: false, message: "Choose your iPhone model to continue." };
    }

    const liveVariant = live.variants.find((entry) => entry.id === variant.id);

    if (!liveVariant) {
      return { ok: false, message: "This option is no longer available." };
    }

    if (isVariantSoldOut(liveVariant)) {
      return { ok: false, message: "This option is sold out." };
    }

    const lineKey = getCartLineKey(live.id, resolvedColorId, liveVariant.id);
    const existing = useCartStore
      .getState()
      .items.find(
        (item) =>
          getCartLineKey(item.productId, item.colorId, item.variantId) === lineKey,
      );
    const requestedQuantity = (existing?.quantity ?? 0) + quantity;

    if (requestedQuantity > liveVariant.quantity) {
      const available = liveVariant.quantity;
      if (available <= 0) {
        return { ok: false, message: "This option is sold out." };
      }

      return {
        ok: false,
        message: `Only ${available} available for this model.`,
      };
    }

    addVariantToCart(live, liveVariant, quantity, resolvedColorId);
    return { ok: true };
  }

  if (live.quantity <= 0) {
    return { ok: false, message: "This product is sold out." };
  }

  const lineKey = getCartLineKey(live.id, resolvedColorId, "");
  const existing = useCartStore
    .getState()
    .items.find(
      (item) => getCartLineKey(item.productId, item.colorId, item.variantId) === lineKey,
    );
  const requestedQuantity = (existing?.quantity ?? 0) + quantity;

  if (requestedQuantity > live.quantity) {
    return {
      ok: false,
      message: `Only ${live.quantity} available.`,
    };
  }

  addVariantToCart(live, undefined, quantity, resolvedColorId);
  return { ok: true };
}
