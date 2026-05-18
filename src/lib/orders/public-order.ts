import type { Order } from "@/types/order";
import type { PublicOrder } from "@/types/public-order";

export function toPublicOrder(order: Order): PublicOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    items: order.items,
    customer: {
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
      city: order.customer.city,
      addressLine1: order.customer.addressLine1,
      postalCode: order.customer.postalCode,
    },
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
  };
}
