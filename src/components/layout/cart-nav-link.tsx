"use client";

import { ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { useCartDrawer } from "@/providers/cart-drawer-provider";
import { useCartStore, selectCartItemCount } from "@/stores/cart-store";

type CartNavLinkProps = {
  className?: string;
};

export function CartNavLink({ className }: CartNavLinkProps = {}) {
  const cartCount = useCartStore(selectCartItemCount);
  const { openCart } = useCartDrawer();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center text-deep transition-colors hover:text-accent sm:h-10 sm:w-10",
        className,
      )}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      {cartCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-white">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      ) : null}
    </button>
  );
}
