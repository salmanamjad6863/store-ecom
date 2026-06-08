"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { Text } from "@/components/ui/text";
import { useCart } from "@/hooks/use-cart";
import { useCartDrawer } from "@/providers/cart-drawer-provider";
import { useProductPreview } from "@/providers/product-preview-provider";
import { cn } from "@/lib/utils/cn";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/utils/scroll-lock";

import { CartDrawerBody } from "./cart-drawer-body";

const ANIMATION_MS = 320;

export function CartDrawer() {
  const { isOpen, closeCart } = useCartDrawer();
  const { isOpen: isPreviewOpen } = useProductPreview();
  const { itemCount } = useCart();
  const [present, setPresent] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPresent(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setPresent(false), ANIMATION_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!present) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPreviewOpen) {
        closeCart();
      }
    };

    lockBodyScroll();
    window.addEventListener("keydown", onKeyDown);

    return () => {
      unlockBodyScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [present, closeCart, isPreviewOpen]);

  if (!present) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-deep/50 backdrop-blur-[2px] transition-opacity duration-300 ease-out",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-label="Close cart"
        onClick={closeCart}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          "absolute flex flex-col overflow-hidden bg-cream shadow-2xl",
          "inset-x-0 bottom-0 max-h-[min(92vh,780px)] rounded-t-[1.75rem]",
          "md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-full md:max-w-[420px] md:rounded-none md:rounded-l-[1.75rem]",
          "transition-transform duration-300 ease-out",
          visible
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full",
        )}
      >
        <div className="relative shrink-0 border-b border-deep/8 px-4 pb-4 pt-5 sm:px-6">
          <div
            className="absolute left-1/2 top-2.5 h-1 w-10 -translate-x-1/2 rounded-full bg-deep/15 md:hidden"
            aria-hidden
          />
          <button
            type="button"
            onClick={closeCart}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-deep/10 bg-white text-deep transition hover:bg-soft sm:right-6"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>

          <Text variant="h2" as="h2" className="font-serif text-2xl text-deep">
            Your bag
          </Text>
          <Text variant="muted" as="p" className="mt-0.5 text-sm">
            {itemCount > 0
              ? `${itemCount} ${itemCount === 1 ? "item" : "items"}`
              : "Nothing here yet"}
          </Text>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <CartDrawerBody onClose={closeCart} />
        </div>
      </div>
    </div>
  );
}
