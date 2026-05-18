"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import type { PublicOrder } from "@/types/public-order";

import { OrderReceipt, publicOrderToReceiptData } from "./order-receipt";

const trackSchema = z.object({
  orderId: z.string().min(8, "Enter your order ID"),
});

type TrackFormValues = z.infer<typeof trackSchema>;

function TrackOrderFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultOrderId = searchParams.get("orderId") ?? "";
  const placedInUrl = searchParams.get("placed") === "1";
  const emailPendingInUrl = searchParams.get("email") === "pending";

  const [trackedOrder, setTrackedOrder] = useState<PublicOrder | null>(null);
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);
  const [autoTracked, setAutoTracked] = useState(false);
  const [showPlacedBanner, setShowPlacedBanner] = useState(placedInUrl);
  const [showLookupForm, setShowLookupForm] = useState(!placedInUrl);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TrackFormValues>({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      orderId: defaultOrderId,
    },
  });

  const lookupOrder = async (orderId: string, fromManualLookup = false) => {
    setNotFoundMessage(null);
    setTrackedOrder(null);

    if (fromManualLookup) {
      setShowPlacedBanner(false);
    }

    const response = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: orderId.trim() }),
    });

    const data = (await response.json()) as { order?: PublicOrder; error?: string };

    if (!response.ok || !data.order) {
      setNotFoundMessage(data.error ?? "Order not found. Check your order ID.");
      return false;
    }

    setTrackedOrder(data.order);
    return true;
  };

  useEffect(() => {
    if (!defaultOrderId || autoTracked) {
      return;
    }

    setAutoTracked(true);
    setValue("orderId", defaultOrderId);

    void lookupOrder(defaultOrderId).then((found) => {
      if (found && placedInUrl) {
        router.replace(`/track-order?orderId=${encodeURIComponent(defaultOrderId)}`, {
          scroll: false,
        });
      }
    }).catch(() => {
      setNotFoundMessage("Could not look up your order. Please try again.");
    });
  }, [autoTracked, defaultOrderId, placedInUrl, router, setValue]);

  const onSubmit = async (values: TrackFormValues) => {
    try {
      await lookupOrder(values.orderId, true);
    } catch {
      setNotFoundMessage("Could not look up your order. Please try again.");
    }
  };

  const isLoadingFirstPlaced = placedInUrl && !trackedOrder && !notFoundMessage;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {placedInUrl ? <ClearCartOnSuccess /> : null}

      {showLookupForm ? (
        <Card className="space-y-6">
          <div>
            <Text variant="h2" as="h2" className="text-xl">
              Track your order
            </Text>
            <Text variant="muted" as="p" className="mt-2">
              Enter the order ID from your confirmation email or receipt.
            </Text>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                placeholder="e.g. a1b2c3d4e5f6g7h8i9j0"
                className="font-mono text-sm"
                {...register("orderId")}
              />
              {errors.orderId ? (
                <Text variant="small" as="p" className="text-danger">
                  {errors.orderId.message}
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
      ) : null}

      {isLoadingFirstPlaced ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : null}

      {trackedOrder ? (
        <>
          <OrderReceipt
            order={publicOrderToReceiptData(trackedOrder)}
            showConfirmationBanner={showPlacedBanner}
            emailPending={emailPendingInUrl && showPlacedBanner}
            showTimeline
          />
          {!showLookupForm ? (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowLookupForm(true);
                  setShowPlacedBanner(false);
                }}
                className="text-sm font-medium text-accent hover:underline"
              >
                Track another order
              </button>
            </div>
          ) : null}
        </>
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
