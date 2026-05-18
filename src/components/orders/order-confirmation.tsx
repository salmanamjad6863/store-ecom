"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useOrderByNumber } from "@/hooks/use-orders";

export function OrderConfirmation() {
  const params = useParams();
  const orderNumber =
    typeof params.orderNumber === "string" ? decodeURIComponent(params.orderNumber) : "";

  const { data: order, isLoading, isError } = useOrderByNumber(orderNumber);

  if (isLoading) {
    return (
      <Container className="flex justify-center py-16">
        <Spinner size="lg" />
      </Container>
    );
  }

  if (isError || !order) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Order not found"
          description="We could not find an order with that number."
          action={
            <Button href="/shop" variant="secondary">
              Back to shop
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2 text-center">
          <Text variant="h1" as="h1">
            Thank you for your order!
          </Text>
          <Text variant="muted" as="p">
            Your order has been placed successfully.
          </Text>
        </div>

        <Card className="space-y-6">
          <div className="rounded-lg border border-accent/30 bg-background p-4 text-center">
            <Text variant="small" as="p" className="text-muted">
              Order number
            </Text>
            <Text variant="h2" as="p" className="mt-1 font-mono text-xl">
              {order.orderNumber}
            </Text>
            <Text variant="small" as="p" className="mt-3 text-muted">
              Save this number to track your order. You will need your phone number when
              tracking.
            </Text>
          </div>

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
              <br />
              {order.customer.phone} · {order.customer.email}
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
          <Button href={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`}>
            Track order
          </Button>
          <Button href="/shop" variant="secondary">
            Continue shopping
          </Button>
        </div>
      </div>
    </Container>
  );
}
