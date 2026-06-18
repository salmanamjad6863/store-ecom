import {
  DELIVERY_FEE_PKR,
  FREE_DELIVERY_THRESHOLD_PKR,
} from "@/lib/constants/storefront";

export { DELIVERY_FEE_PKR, FREE_DELIVERY_THRESHOLD_PKR };

/** Cart and order amounts are stored in minor units (paisa). */
const FREE_DELIVERY_THRESHOLD = FREE_DELIVERY_THRESHOLD_PKR * 100;
const DELIVERY_FEE = DELIVERY_FEE_PKR * 100;

export type OrderPricing = {
  subtotal: number;
  shipping: number;
  total: number;
  isFreeDelivery: boolean;
};

/** Rs 200 delivery; free when subtotal is Rs 5,000 or more. Amounts in minor units (paisa). */
export function calculateShipping(subtotal: number): number {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) {
    return 0;
  }

  return DELIVERY_FEE;
}

export function calculateOrderTotal(subtotal: number): number {
  return subtotal + calculateShipping(subtotal);
}

export function getOrderPricing(subtotal: number): OrderPricing {
  const shipping = calculateShipping(subtotal);

  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
    isFreeDelivery: shipping === 0,
  };
}
