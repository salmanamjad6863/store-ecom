"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Container } from "@/components/ui/container";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useCart } from "@/hooks/use-cart";
import { useRevalidateCart } from "@/hooks/use-revalidate-cart";

import { CartSyncNotice } from "../cart/cart-sync-notice";

import { CheckoutForm } from "./checkout-form";

export function CheckoutContent() {
  const router = useRouter();
  const { items, getSubtotal } = useCart();
  const { revalidate, isRevalidating, lastResult } = useRevalidateCart();
  const subtotal = getSubtotal();
  const [isCompletingCheckout, setIsCompletingCheckout] = useState(false);
  const [hasRevalidated, setHasRevalidated] = useState(false);

  useEffect(() => {
    if (items.length === 0 || hasRevalidated) {
      return;
    }

    setHasRevalidated(true);

    void revalidate().then((result) => {
      if (result.hasBlockingIssues || result.issues.some((i) => i.type === "sold_out")) {
        router.replace("/cart");
      }
    });
  }, [hasRevalidated, items.length, revalidate, router]);

  useEffect(() => {
    if (items.length === 0 && !isCompletingCheckout && hasRevalidated) {
      router.replace("/cart");
    }
  }, [items.length, isCompletingCheckout, hasRevalidated, router]);

  if ((!hasRevalidated || isRevalidating) && items.length > 0) {
    return (
      <Container className="flex justify-center py-16">
        <Spinner size="lg" />
      </Container>
    );
  }

  if (items.length === 0 && !isCompletingCheckout) {
    return (
      <Container className="flex justify-center py-16">
        <Spinner size="lg" />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-12">
      <div className="mb-8 flex flex-col gap-2">
        <Text variant="h1" as="h1">
          Checkout
        </Text>
        <Text variant="muted" as="p">
          Complete your details to place a cash on delivery order.
        </Text>
      </div>

      <CartSyncNotice result={lastResult} />

      <CheckoutForm
        items={items}
        subtotal={subtotal}
        onCompletingChange={setIsCompletingCheckout}
      />
    </Container>
  );
}
