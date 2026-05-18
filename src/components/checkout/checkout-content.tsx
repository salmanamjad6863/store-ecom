"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Container } from "@/components/ui/container";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useCart } from "@/hooks/use-cart";

import { CheckoutForm } from "./checkout-form";

export function CheckoutContent() {
  const router = useRouter();
  const { items, getSubtotal } = useCart();
  const subtotal = getSubtotal();
  const [isCompletingCheckout, setIsCompletingCheckout] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !isCompletingCheckout) {
      router.replace("/cart");
    }
  }, [items.length, isCompletingCheckout, router]);

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

      <CheckoutForm
        items={items}
        subtotal={subtotal}
        onCompletingChange={setIsCompletingCheckout}
      />
    </Container>
  );
}
