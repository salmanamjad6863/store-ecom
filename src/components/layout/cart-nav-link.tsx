"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { useCartStore, selectCartItemCount } from "@/stores/cart-store";

export function CartNavLink() {
  const cartCount = useCartStore(selectCartItemCount);

  return (
    <Link
      href="/cart"
      aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-background sm:h-10 sm:w-10",
      )}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      {cartCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-white">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      ) : null}
    </Link>
  );
}
