import { fetchProductWithVariantsById } from "@/lib/queries/products";
import { getColorById } from "@/lib/utils/product-colors";
import { isVariantSoldOut, productHasVariants } from "@/lib/utils/variant";
import { addVariantToCart, useCartStore } from "@/stores/cart-store";
import { getCartLineKey } from "@/types/cart";
import type { Product } from "@/types/product";
import type { ProductVariant } from "@/types/product-variant";
import type { ProductWithVariants } from "@/types/product";

export type AddToCartResult =
  | { ok: true }
  | { ok: false; message: string };

type AddToCartOptions = {
  /** Already-loaded catalog row — skips a network round-trip when variants are present. */
  catalog?: ProductWithVariants;
};

function canUseCatalog(product: Product, catalog?: ProductWithVariants): catalog is ProductWithVariants {
  if (!catalog || catalog.id !== product.id || catalog.hidden) {
    return false;
  }

  if (productHasVariants(catalog)) {
    return catalog.variants.length > 0;
  }

  return true;
}

function validateAndAdd(
  live: ProductWithVariants,
  variant: ProductVariant | undefined,
  quantity: number,
  colorId?: string,
): AddToCartResult {
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
      return { ok: false, message: "This option is sold out." };
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
    return { ok: false, message: "This product is sold out." };
  }

  addVariantToCart(live, undefined, quantity, resolvedColorId);
  return { ok: true };
}

export async function addVariantToCartLive(
  product: Product,
  variant: ProductVariant | undefined,
  quantity = 1,
  colorId?: string,
  options: AddToCartOptions = {},
): Promise<AddToCartResult> {
  if (canUseCatalog(product, options.catalog)) {
    return validateAndAdd(options.catalog, variant, quantity, colorId);
  }

  const live = await fetchProductWithVariantsById(product.id);

  if (!live || live.hidden) {
    return { ok: false, message: "This product is no longer available." };
  }

  return validateAndAdd(live, variant, quantity, colorId);
}
