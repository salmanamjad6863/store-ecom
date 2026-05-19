"use client";

import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";

type CartMobileBarProps = {
  subtotal: number;
  itemCount: number;
};

export function CartMobileBar({ subtotal, itemCount }: CartMobileBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-muted/20 bg-surface p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <section>
          <p className="text-xs text-muted">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
          <Price amount={subtotal} className="text-lg" />
        </section>
        <Button href="/checkout" size="lg" className="shrink-0">
          Checkout
        </Button>
      </div>
    </div>
  );
}
