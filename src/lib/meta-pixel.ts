import { env } from "@/lib/env";
import { getOrderPricing } from "@/lib/orders/shipping";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

import { getProductDisplayPrice } from "./utils/product";

export type MetaStandardEvent =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

type MetaEventParams = Record<string, string | number | string[] | undefined>;

type MetaEventOptions = {
  eventID?: string;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

export function getMetaPixelId(): string | null {
  const id = env.metaPixelId?.trim();
  return id ? id : null;
}

export function isMetaPixelEnabled(): boolean {
  return Boolean(getMetaPixelId() && typeof window !== "undefined" && typeof window.fbq === "function");
}

function minorToMajor(minor: number): number {
  return Math.round(minor) / 100;
}

function currencyCode(): string {
  return env.currency.code;
}

export function trackMetaEvent(
  event: MetaStandardEvent,
  params?: MetaEventParams,
  options?: MetaEventOptions,
): void {
  if (!isMetaPixelEnabled()) {
    return;
  }

  const payload = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
      )
    : undefined;

  if (options?.eventID) {
    window.fbq!("track", event, payload, { eventID: options.eventID });
    return;
  }

  if (payload) {
    window.fbq!("track", event, payload);
    return;
  }

  window.fbq!("track", event);
}

export function trackMetaPageView(): void {
  trackMetaEvent("PageView");
}

export function trackMetaViewContent(product: Product): void {
  const { amount } = getProductDisplayPrice(product);

  trackMetaEvent("ViewContent", {
    content_ids: [product.id],
    content_name: product.theme || product.name,
    content_type: "product",
    content_category: product.type,
    value: minorToMajor(amount),
    currency: currencyCode(),
  });
}

export function trackMetaAddToCart(
  product: Product,
  quantity: number,
  unitPriceMinor: number,
): void {
  trackMetaEvent("AddToCart", {
    content_ids: [product.id],
    content_name: product.theme || product.name,
    content_type: "product",
    value: minorToMajor(unitPriceMinor * quantity),
    currency: currencyCode(),
    num_items: quantity,
  });
}

export function trackMetaInitiateCheckout(items: CartItem[], subtotalMinor: number): void {
  const pricing = getOrderPricing(subtotalMinor);

  trackMetaEvent("InitiateCheckout", {
    content_ids: items.map((item) => item.productId),
    num_items: items.reduce((total, item) => total + item.quantity, 0),
    value: minorToMajor(pricing.total),
    currency: currencyCode(),
  });
}

export function trackMetaPurchase(
  orderId: string,
  items: CartItem[],
  subtotalMinor: number,
): void {
  const pricing = getOrderPricing(subtotalMinor);
  const purchaseKey = `meta-purchase-${orderId}`;

  if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(purchaseKey)) {
    return;
  }

  trackMetaEvent(
    "Purchase",
    {
      content_ids: items.map((item) => item.productId),
      num_items: items.reduce((total, item) => total + item.quantity, 0),
      value: minorToMajor(pricing.total),
      currency: currencyCode(),
    },
    { eventID: orderId },
  );

  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(purchaseKey, "1");
  }
}
