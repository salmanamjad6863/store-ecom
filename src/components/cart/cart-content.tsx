"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
import { useCart } from "@/hooks/use-cart";

import { CartLineItem } from "./cart-line-item";
import { CartSummary } from "./cart-summary";

export function CartContent() {
  const { items, itemCount, updateQuantity, removeItem, getSubtotal } = useCart();
  const subtotal = getSubtotal();

  if (items.length === 0) {
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

  return (
    <Container className="py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
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

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-10">
        <ul className="rounded-xl border border-muted/20 bg-surface px-3 sm:px-6">
          {items.map((item) => (
            <CartLineItem
              key={item.productId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </ul>

        <CartSummary subtotal={subtotal} itemCount={itemCount} />
      </div>
    </Container>
  );
}
