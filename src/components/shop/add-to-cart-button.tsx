"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { addVariantToCartLive } from "@/lib/cart/add-to-cart-live";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/providers/toast-provider";
import type { Product } from "@/types/product";
import type { ProductVariant } from "@/types/product-variant";
import { isProductSoldOut } from "@/lib/utils/product";
import { isVariantSoldOut, productHasVariants } from "@/lib/utils/variant";

type AddToCartButtonProps = {
  product: Product;
  variant?: ProductVariant;
  colorId?: string;
  colorName?: string;
  quantity?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function AddToCartButton({
  product,
  variant,
  colorId,
  colorName,
  quantity = 1,
  size = "md",
  className,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const soldOut = variant
    ? isVariantSoldOut(variant)
    : isProductSoldOut(product);

  const requiresVariant = productHasVariants(product);

  const handleClick = async () => {
    if (soldOut || (requiresVariant && !variant) || isAdding) {
      return;
    }

    const resolvedColorId = colorId ?? variant?.colorId ?? product.colors[0]?.colorId ?? "default";

    setIsAdding(true);

    try {
      const result = await addVariantToCartLive(product, variant, quantity, resolvedColorId);

      if (!result.ok) {
        toast(result.message, "error");
        return;
      }

      setAdded(true);

      const label =
        variant && colorName
          ? `${product.name} (${variant.modelName} · ${colorName})`
          : product.name;

      toast(
        quantity > 1 ? `${quantity} × ${label} added to cart` : `${label} added to cart`,
        "success",
      );
      window.setTimeout(() => setAdded(false), 1500);
    } finally {
      setIsAdding(false);
    }
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
      disabled={soldOut || (requiresVariant && !variant) || isAdding}
      onClick={() => void handleClick()}
    >
      {soldOut
        ? "Sold out"
        : isAdding
          ? "Adding…"
          : requiresVariant && !variant
            ? "Select options"
            : added
              ? "Added!"
              : "Add to cart"}
    </Button>
  );
}
