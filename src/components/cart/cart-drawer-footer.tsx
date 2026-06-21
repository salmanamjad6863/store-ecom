"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { OrderPricingSummary } from "@/components/orders/order-pricing-summary";
import { Text } from "@/components/ui/text";
import { useRevalidateCart } from "@/hooks/use-revalidate-cart";
import { markCartRevalidated } from "@/lib/cart/revalidate-stamp";
import { getOrderPricing } from "@/lib/orders/shipping";
import { scrollToTop } from "@/lib/utils/scroll-lock";
import { useToast } from "@/providers/toast-provider";
import { useCartStore } from "@/stores/cart-store";

type CartDrawerFooterProps = {
  subtotal: number;
  itemCount: number;
};

export function CartDrawerFooter({ subtotal, itemCount }: CartDrawerFooterProps) {
  const router = useRouter();
  const { revalidate } = useRevalidateCart();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const pricing = getOrderPricing(subtotal);

  const handleCheckout = async () => {
    setIsCheckingOut(true);

    try {
      const result = await revalidate();
      const items = useCartStore.getState().items;

      if (items.length === 0) {
        toast("Your cart is empty — items may have sold out.", "info");
        return;
      }

      if (result.hasBlockingIssues) {
        toast("Your cart was updated — review items before checkout.", "info");
        return;
      }

      scrollToTop();
      markCartRevalidated();
      router.push("/checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="shrink-0 border-t border-deep/10 bg-cream px-5 py-4 shadow-[0_-10px_30px_rgba(45,37,32,0.08)] sm:px-6">
      <div className="mb-4 space-y-2">
        <div className="text-sm text-muted">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </div>
        <OrderPricingSummary
          subtotal={pricing.subtotal}
          shipping={pricing.shipping}
          total={pricing.total}
          totalLabel="Total"
          className="border-t border-deep/6 pt-2 [&_span]:text-deep [&_p]:text-deep"
        />
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={isCheckingOut || itemCount === 0}
        onClick={() => void handleCheckout()}
      >
        {isCheckingOut ? "Checking stock…" : "Proceed to checkout"}
      </Button>

      <Text variant="small" as="p" className="mt-2 text-center text-muted">
        Cash on delivery
      </Text>
    </div>
  );
}
