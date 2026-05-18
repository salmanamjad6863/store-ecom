"use client";

import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { useCartStore, selectCartItemCount } from "@/stores/cart-store";

export function CartNavLink() {
  const cartCount = useCartStore(selectCartItemCount);

  return (
    <Link
      href="/cart"
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background",
      )}
    >
      Cart
      {cartCount > 0 ? (
        <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs text-white">
          {cartCount}
        </span>
      ) : null}
    </Link>
  );
}
