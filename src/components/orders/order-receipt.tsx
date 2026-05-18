import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { Text } from "@/components/ui/text";
import type { Order } from "@/types/order";
import type { PublicOrder } from "@/types/public-order";

import { OrderStatusTimeline } from "./order-status-timeline";

export type OrderReceiptData = {
  id: string;
  orderNumber: string;
  status: Order["status"];
  items: Order["items"];
  customer: {
    name: string;
    phone?: string;
    email?: string;
    addressLine1: string;
    city: string;
    postalCode?: string;
  };
  total: number;
};

type OrderReceiptProps = {
  order: OrderReceiptData;
  showConfirmationBanner?: boolean;
  emailPending?: boolean;
  showTimeline?: boolean;
};

export function orderToReceiptData(order: Order): OrderReceiptData {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    items: order.items,
    customer: order.customer,
    total: order.total,
  };
}

export function publicOrderToReceiptData(order: PublicOrder): OrderReceiptData {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    items: order.items,
    customer: order.customer,
    total: order.total,
  };
}

export function OrderReceipt({
  order,
  showConfirmationBanner = false,
  emailPending = false,
  showTimeline = true,
}: OrderReceiptProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {showConfirmationBanner ? (
        <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 text-center sm:p-6">
          <CheckCircle2 className="mx-auto h-10 w-10 text-accent sm:h-12 sm:w-12" aria-hidden />
          <Text variant="h1" as="h1" className="mt-3 text-xl sm:mt-4 sm:text-3xl">
            Order placed successfully!
          </Text>
          <Text variant="muted" as="p" className="mt-2">
            Your order is confirmed. Save your order ID below to track delivery anytime.
          </Text>
          {order.customer.email ? (
            <Text variant="small" as="p" className="mt-3 text-accent">
              {emailPending
                ? `A confirmation email is being sent to ${order.customer.email}.`
                : `A confirmation email was sent to ${order.customer.email}.`}
            </Text>
          ) : null}
        </div>
      ) : null}

      <Card className="space-y-6">
        <div className="rounded-lg border border-accent/30 bg-background p-4 text-center">
          <Text variant="small" as="p" className="text-muted">
            Order ID
          </Text>
          <Text variant="h2" as="p" className="mt-1 break-all font-mono text-sm">
            {order.id}
          </Text>
          <Text variant="small" as="p" className="mt-4 text-muted">
            Order number
          </Text>
          <Text variant="body" as="p" className="mt-1 font-mono text-lg">
            {order.orderNumber}
          </Text>
        </div>

        {showTimeline ? <OrderStatusTimeline status={order.status} /> : null}

        <div className="space-y-2">
          <Text variant="h2" as="h3" className="text-lg">
            Payment
          </Text>
          <Text variant="body" as="p">
            Cash on Delivery — please have the exact amount ready when your order arrives.
          </Text>
        </div>

        <div className="space-y-2">
          <Text variant="h2" as="h3" className="text-lg">
            Delivery to
          </Text>
          <Text variant="body" as="p">
            {order.customer.name}
            <br />
            {order.customer.addressLine1}
            <br />
            {order.customer.city}
            {order.customer.postalCode ? `, ${order.customer.postalCode}` : ""}
            {order.customer.phone ? (
              <>
                <br />
                {order.customer.phone}
              </>
            ) : null}
            {order.customer.email ? (
              <>
                <br />
                {order.customer.email}
              </>
            ) : null}
          </Text>
        </div>

        <ul className="space-y-4 border-t border-muted/20 pt-4">
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.slug}`} className="flex gap-4">
              {item.image ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-muted/20">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 justify-between gap-4">
                <div>
                  <Text variant="body" as="p" className="font-medium">
                    {item.name}
                  </Text>
                  <Text variant="small" as="p">
                    Qty {item.quantity}
                  </Text>
                </div>
                <Price amount={item.unitPrice * item.quantity} />
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-muted/20 pt-4">
          <Text variant="h2" as="span" className="text-lg">
            Total
          </Text>
          <Price amount={order.total} className="text-lg" />
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button href="/shop" variant="secondary">
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
