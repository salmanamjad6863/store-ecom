"use client";

import { Card } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { Text } from "@/components/ui/text";
import { OrderPricingSummary } from "@/components/orders/order-pricing-summary";
import { getOrderPricing } from "@/lib/orders/shipping";
import { useCartStore, selectCartSubtotal } from "@/stores/cart-store";
import { getCartLineKey } from "@/types/cart";

/** Live order summary — stays in sync when the cart drawer edits quantities. */
export function CheckoutOrderSummary() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore(selectCartSubtotal);
  const pricing = getOrderPricing(subtotal);

  return (
    <Card className="h-fit space-y-4">
      <Text variant="h2" as="h2" className="text-xl">
        Your order
      </Text>
      <ul className="space-y-3 border-b border-muted/20 pb-4">
        {items.map((item) => (
          <li
            key={getCartLineKey(item.productId, item.colorId, item.variantId)}
            className="flex justify-between gap-4 text-sm"
          >
            <span className="text-muted">
              {item.name}
              {item.modelName && item.colorName
                ? ` (${item.modelName} · ${item.colorName})`
                : ""}{" "}
              × {item.quantity}
            </span>
            <Price amount={item.unitPrice * item.quantity} />
          </li>
        ))}
      </ul>
      <OrderPricingSummary
        subtotal={pricing.subtotal}
        shipping={pricing.shipping}
        total={pricing.total}
      />
    </Card>
  );
}
