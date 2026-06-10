"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Text } from "@/components/ui/text";
import { scrollToTop } from "@/lib/utils/scroll-lock";

type CartDrawerFooterProps = {
  subtotal: number;
  itemCount: number;
  onClose: () => void;
};

export function CartDrawerFooter({ subtotal, itemCount, onClose }: CartDrawerFooterProps) {
  const router = useRouter();

  const handleCheckout = () => {
    onClose();
    scrollToTop();
    router.push("/checkout");
  };

  return (
    <div className="shrink-0 border-t border-deep/10 bg-cream px-5 py-4 shadow-[0_-10px_30px_rgba(45,37,32,0.08)] sm:px-6">
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
          <Price amount={subtotal} className="text-sm" />
        </div>
        <div className="flex items-center justify-between border-t border-deep/6 pt-2">
          <Text variant="h2" as="span" className="font-serif text-lg text-deep">
            Total
          </Text>
          <Price amount={subtotal} className="text-xl font-semibold" />
        </div>
      </div>

      <Button type="button" size="lg" className="w-full" onClick={handleCheckout}>
        Proceed to checkout
      </Button>

      <Text variant="small" as="p" className="mt-2 text-center text-muted">
        Cash on delivery
      </Text>
    </div>
  );
}
