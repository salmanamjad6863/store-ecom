"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useCart } from "@/hooks/use-cart";
import { useRevalidateCart } from "@/hooks/use-revalidate-cart";
import { useToast } from "@/providers/toast-provider";
import { getCartLineKey } from "@/types/cart";

import { CartLineItem } from "./cart-line-item";
import { CartMobileBar } from "./cart-mobile-bar";
import { CartSummary } from "./cart-summary";
import { CartSyncNotice } from "./cart-sync-notice";

export function CartContent() {
  const { items, itemCount, updateQuantity, removeItem, getSubtotal } = useCart();
  const { revalidate, isRevalidating, lastResult } = useRevalidateCart();
  const { toast } = useToast();
  const subtotal = getSubtotal();

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    void revalidate().then((result) => {
      if (result.issues.length > 0) {
        toast("Your cart was updated with the latest prices and stock.", "info");
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run once on cart mount

  if (items.length === 0 && !isRevalidating) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Your cart is empty"
          description="Browse the shop and add items to get started."
          action={
            <Button href="/shop" size="lg">
              Continue shopping
            </Button>
          }
        />
      </Container>
    );
  }

  if (isRevalidating && items.length === 0) {
    return (
      <Container className="flex justify-center py-16">
        <Spinner size="lg" />
      </Container>
    );
  }

  return (
    <>
      <Container className="pb-28 pt-8 sm:py-12 lg:pb-12">
        <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Text variant="h1" as="h1">
              Cart
            </Text>
            <Text variant="muted" as="p">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </Text>
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium text-accent hover:underline"
          >
            Continue shopping
          </Link>
        </div>

        <CartSyncNotice result={lastResult} />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-10">
          <ul className="rounded-xl border border-muted/20 bg-surface px-3 sm:px-6">
            {items.map((item) => (
              <CartLineItem
                key={getCartLineKey(item.productId, item.colorId, item.variantId)}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </ul>

          <CartSummary subtotal={subtotal} itemCount={itemCount} />
        </div>
      </Container>

      <CartMobileBar subtotal={subtotal} itemCount={itemCount} />
    </>
  );
}
