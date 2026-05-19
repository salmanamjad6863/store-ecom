import type { OrderStatus } from "@/types/order";

/** Customer-facing labels (storefront / track order). */
export const CUSTOMER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Order received",
  transferred: "Confirmed for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const CUSTOMER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  pending: "We received your order and are preparing it.",
  transferred: "Your order is confirmed and will be delivered soon.",
  delivered: "Your order has been delivered. Thank you for shopping with us.",
  cancelled: "This order was cancelled.",
};

/** Admin-facing labels (dashboard). */
export const ADMIN_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  transferred: "Transferred",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function getCustomerStatusLabel(status: OrderStatus): string {
  return CUSTOMER_STATUS_LABELS[status];
}
