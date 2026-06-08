"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/hooks/use-cart";
import { useRevalidateCart } from "@/hooks/use-revalidate-cart";
import { useProductPreview } from "@/providers/product-preview-provider";
import { useToast } from "@/providers/toast-provider";
import { getCartLineKey } from "@/types/cart";

import { CartDrawerFooter } from "./cart-drawer-footer";
import { CartLineItem } from "./cart-line-item";
import { CartSyncNotice } from "./cart-sync-notice";

type CartDrawerBodyProps = {
  onClose: () => void;
};

export function CartDrawerBody({ onClose }: CartDrawerBodyProps) {
  const { items, itemCount, updateQuantity, removeItem, getSubtotal } = useCart();
  const { revalidate, isRevalidating, lastResult } = useRevalidateCart();
  const { openPreviewFromCartItem } = useProductPreview();
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
    // Revalidate once when the drawer body mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isRevalidating && items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <EmptyState
          title="Your bag is empty"
          description="Browse the shop and add something you love."
          action={
            <Button type="button" size="lg" onClick={onClose}>
              Continue shopping
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <CartSyncNotice result={lastResult} className="mx-5 mt-4 sm:mx-6" />

        <ul className="mt-3 bg-surface/50">
          {items.map((item) => (
            <CartLineItem
              key={getCartLineKey(item.productId, item.colorId, item.variantId)}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
              onOpenPreview={(cartItem) => {
                void openPreviewFromCartItem(cartItem);
              }}
            />
          ))}
        </ul>
      </div>

      <CartDrawerFooter subtotal={subtotal} itemCount={itemCount} onClose={onClose} />
    </div>
  );
}
