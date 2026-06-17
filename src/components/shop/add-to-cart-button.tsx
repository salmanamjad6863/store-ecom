"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { addVariantToCartLive } from "@/lib/cart/add-to-cart-live";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/providers/toast-provider";
import type { Product, ProductWithVariants } from "@/types/product";
import type { ProductVariant } from "@/types/product-variant";
import { isProductSoldOut } from "@/lib/utils/product";
import { isVariantSoldOut, productHasVariants } from "@/lib/utils/variant";

type AddToCartButtonProps = {
  product: Product;
  catalog?: ProductWithVariants;
  variant?: ProductVariant;
  colorId?: string;
  colorName?: string;
  quantity?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function AddToCartButton({
  product,
  catalog,
  variant,
  colorId,
  colorName,
  quantity = 1,
  size = "md",
  className,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const isAddingRef = useRef(false);
  const { toast } = useToast();

  const soldOut = variant
    ? isVariantSoldOut(variant)
    : isProductSoldOut(product);

  const requiresVariant = productHasVariants(product);

  const handleClick = async () => {
    if (soldOut || (requiresVariant && !variant) || isAddingRef.current) {
      return;
    }

    const resolvedColorId = colorId ?? variant?.colorId ?? product.colors[0]?.colorId ?? "default";

    isAddingRef.current = true;
    setIsAdding(true);

    try {
      const result = await addVariantToCartLive(product, variant, quantity, resolvedColorId, {
        catalog,
      });

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
      isAddingRef.current = false;
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
      aria-busy={isAdding}
      onClick={() => void handleClick()}
    >
      {soldOut
        ? "Sold out"
        : isAdding
          ? "Adding to cart…"
          : requiresVariant && !variant
            ? "Select options"
            : added
              ? "Added!"
              : "Add to cart"}
    </Button>
  );
}
