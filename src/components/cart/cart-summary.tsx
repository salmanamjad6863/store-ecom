"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { Text } from "@/components/ui/text";

type CartSummaryProps = {
  subtotal: number;
  itemCount: number;
};

export function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  return (
    <Card className="sticky top-6 flex flex-col gap-6">
      <Text variant="h2" as="h2" className="text-xl">
        Order summary
      </Text>

      <div className="space-y-3 border-b border-muted/20 pb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Items ({itemCount})</span>
          <Price amount={subtotal} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">Shipping</span>
          <Text variant="small" as="span">
            Calculated at checkout
          </Text>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Text variant="h2" as="span" className="text-lg">
          Subtotal
        </Text>
        <Price amount={subtotal} className="text-lg" />
      </div>

      <Button href="/checkout" size="lg" className="w-full">
        Proceed to checkout
      </Button>

      <Text variant="small" as="p" className="text-center">
        Cash on delivery — pay when your order arrives.
      </Text>
    </Card>
  );
}
