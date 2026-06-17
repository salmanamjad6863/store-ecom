"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { useCart } from "@/hooks/use-cart";
import { useCartHydrated } from "@/hooks/use-cart-hydrated";
import { useRevalidateCart } from "@/hooks/use-revalidate-cart";
import { useCartDrawer } from "@/providers/cart-drawer-provider";
import { scrollToTop } from "@/lib/utils/scroll-lock";

import { CheckoutForm } from "./checkout-form";

export function CheckoutContent() {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const { items, getSubtotal } = useCart();
  const { revalidate, isRevalidating, lastResult } = useRevalidateCart();
  const { openCart } = useCartDrawer();
  const subtotal = getSubtotal();
  const [isCompletingCheckout, setIsCompletingCheckout] = useState(false);
  const [initialSyncDone, setInitialSyncDone] = useState(false);

  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void revalidate().finally(() => setInitialSyncDone(true));
  }, [hydrated, revalidate]);

  useEffect(() => {
    if (!hydrated || !initialSyncDone || isCompletingCheckout || items.length > 0) {
      return;
    }

    openCart();
    router.replace("/shop");
  }, [hydrated, initialSyncDone, isCompletingCheckout, items.length, openCart, router]);

  useEffect(() => {
    if (hydrated && items.length > 0) {
      scrollToTop();
    }
  }, [hydrated, items.length]);

  if (!hydrated || !initialSyncDone) {
    return null;
  }

  if (items.length === 0 && !isCompletingCheckout) {
    return null;
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

      <CheckoutForm
        items={items}
        subtotal={subtotal}
        onCompletingChange={setIsCompletingCheckout}
        syncResult={lastResult}
        isRevalidating={isRevalidating}
        onRevalidate={revalidate}
      />
    </Container>
  );
}
