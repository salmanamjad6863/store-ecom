"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { addProductToCart } from "@/stores/cart-store";
import type { Product } from "@/types/product";
import { isProductSoldOut } from "@/lib/utils/product";

type AddToCartButtonProps = {
  product: Product;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function AddToCartButton({ product, size = "md", className }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const soldOut = isProductSoldOut(product);

  const handleClick = () => {
    if (soldOut) {
      return;
    }

    addProductToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Button
      type="button"
      size={size}
      variant={soldOut ? "secondary" : "primary"}
      className={cn(
        className,
        soldOut && "border-danger/40 bg-danger/10 font-semibold text-danger disabled:opacity-100",
      )}
      disabled={soldOut}
      onClick={handleClick}
    >
      {soldOut ? "Sold out" : added ? "Added!" : "Add to cart"}
    </Button>
  );
}
