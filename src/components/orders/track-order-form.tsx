"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Price } from "@/components/ui/price";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import type { PublicOrder } from "@/types/public-order";

import { OrderStatusTimeline } from "./order-status-timeline";

const trackSchema = z.object({
  orderNumber: z.string().min(5, "Enter your order number"),
  phone: z.string().min(10, "Enter the phone number used at checkout"),
});

type TrackFormValues = z.infer<typeof trackSchema>;

function TrackOrderFormInner() {
  const searchParams = useSearchParams();
  const defaultOrderNumber = searchParams.get("orderNumber") ?? "";

  const [trackedOrder, setTrackedOrder] = useState<PublicOrder | null>(null);
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TrackFormValues>({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      orderNumber: defaultOrderNumber,
      phone: "",
    },
  });

  const onSubmit = async (values: TrackFormValues) => {
    setNotFoundMessage(null);
    setTrackedOrder(null);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: values.orderNumber.trim(),
          phone: values.phone.trim(),
        }),
      });

      const data = (await response.json()) as { order?: PublicOrder; error?: string };

      if (!response.ok || !data.order) {
        setNotFoundMessage(data.error ?? "Order not found. Check your order number and phone.");
        return;
      }

      setTrackedOrder(data.order);
    } catch {
      setNotFoundMessage("Could not look up your order. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <Card className="space-y-6">
        <div>
          <Text variant="h2" as="h2" className="text-xl">
            Track your order
          </Text>
          <Text variant="muted" as="p" className="mt-2">
            Enter the order number from your confirmation and the phone number you used at
            checkout.
          </Text>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderNumber">Order number</Label>
            <Input
              id="orderNumber"
              placeholder="ORD-20260518-A7K2"
              {...register("orderNumber")}
            />
            {errors.orderNumber ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.orderNumber.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
            {errors.phone ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.phone.message}
              </Text>
            ) : null}
          </div>

          {notFoundMessage ? (
            <Text variant="small" as="p" className="text-danger">
              {notFoundMessage}
            </Text>
          ) : null}

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Looking up…" : "Track order"}
          </Button>
        </form>
      </Card>

      {trackedOrder ? (
        <Card className="space-y-6">
          <div>
            <Text variant="small" as="p" className="text-muted">
              Order number
            </Text>
            <Text variant="h2" as="p" className="font-mono text-lg">
              {trackedOrder.orderNumber}
            </Text>
          </div>

          <OrderStatusTimeline status={trackedOrder.status} />

          <ul className="space-y-2 border-t border-muted/20 pt-4 text-sm">
            {trackedOrder.items.map((item) => (
              <li key={`${item.productId}-${item.slug}`} className="flex justify-between gap-4">
                <span className="text-muted">
                  {item.name} × {item.quantity}
                </span>
                <Price amount={item.unitPrice * item.quantity} />
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-muted/20 pt-4">
            <Text variant="h2" as="span">
              Total
            </Text>
            <Price amount={trackedOrder.total} />
          </div>

          <Text variant="small" as="p" className="text-muted">
            Delivery: {trackedOrder.customer.addressLine1}, {trackedOrder.customer.city}
            {trackedOrder.customer.postalCode ? ` ${trackedOrder.customer.postalCode}` : ""}
          </Text>
        </Card>
      ) : null}
    </div>
  );
}

export function TrackOrderForm() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      }
    >
      <TrackOrderFormInner />
    </Suspense>
  );
}
