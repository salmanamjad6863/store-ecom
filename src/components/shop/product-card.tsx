"use client";

import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Price } from "@/components/ui/price";
import { prefetchProductBySlug } from "@/lib/queries/prefetch-product";
import {
  getColorById,
  resolveListingDisplayColor,
} from "@/lib/utils/product-colors";
import { getProductDisplayPrice, isProductSoldOut } from "@/lib/utils/product";
import { cn } from "@/lib/utils/cn";
import { useProductPreview } from "@/providers/product-preview-provider";
import type { Product } from "@/types/product";

import { ProductCardBadge } from "./product-card-badge";
import { ProductCardShell } from "./product-card-shell";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const queryClient = useQueryClient();
  const { openPreview } = useProductPreview();
  const isMultiColor = product.colors.length > 1;

  const initialColor = useMemo(() => resolveListingDisplayColor(product), [product]);

  const [selectedColorId, setSelectedColorId] = useState(initialColor.colorId);
  const [displayColor, setDisplayColor] = useState(initialColor);

  useEffect(() => {
    const preferred = getColorById(product, selectedColorId);
    if (preferred && (preferred.totalQuantity ?? 0) > 0) {
      setDisplayColor(preferred);
      return;
    }
    const fallback = resolveListingDisplayColor(product, selectedColorId);
    setDisplayColor(fallback);
    if (fallback.colorId !== selectedColorId) {
      setSelectedColorId(fallback.colorId);
    }
  }, [product, selectedColorId]);

  const { amount, compareAt } = getProductDisplayPrice(product);
  const image =
    displayColor.heroImage ??
    displayColor.images[0] ??
    product.heroImage ??
    product.images[0] ??
    "";

  const modelCount =
    displayColor.availableModelIds && displayColor.availableModelIds.length > 0
      ? `${displayColor.availableModelIds.length} models`
      : product.availableModelIds && product.availableModelIds.length > 0
        ? `${product.availableModelIds.length} models`
        : null;

  const metaParts = [
    product.type,
    isMultiColor && displayColor.colorName ? displayColor.colorName : null,
    modelCount,
  ].filter(Boolean);

  const handleOpenPreview = () => {
    void prefetchProductBySlug(queryClient, product.slug);
    openPreview(product, { initialColorId: displayColor.colorId });
  };

  const colorSwatches = isMultiColor ? (
    <div
      className="flex flex-wrap justify-center gap-2"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {product.colors.map((color) => {
        const isActive = color.colorId === selectedColorId;
        const colorSoldOut = (color.totalQuantity ?? 0) <= 0;

        return (
          <button
            key={color.id}
            type="button"
            title={colorSoldOut ? `${color.colorName} — sold out` : color.colorName}
            aria-label={`${color.colorName}${isActive ? " (selected)" : ""}`}
            onClick={() => setSelectedColorId(color.colorId)}
            className={cn(
              "relative h-6 w-6 rounded-full border transition-all hover:scale-110 sm:h-7 sm:w-7",
              isActive ? "border-deep ring-2 ring-deep/15 ring-offset-1" : "border-deep/10",
              colorSoldOut && "opacity-40",
            )}
          >
            <span
              className="absolute inset-0.5 rounded-full"
              style={{ backgroundColor: color.colorHex ?? "#d4d4d4" }}
            />
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <ProductCardShell
      className="h-full cursor-pointer"
      onClick={handleOpenPreview}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpenPreview();
        }
      }}
        role="button"
        tabIndex={0}
        aria-label={`Preview ${product.theme}`}
        image={
          <>
            {image ? (
              <Image
                key={`${product.id}-${displayColor.colorId}`}
                src={image}
                alt={product.theme}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={cn(
                  "object-cover transition-transform duration-500 group-hover:scale-[1.03]",
                  isProductSoldOut(product) && "opacity-80 saturate-[0.85]",
                )}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted">
                No image
              </div>
            )}
          </>
        }
        badge={<ProductCardBadge product={product} />}
        meta={<span>{metaParts.join(" · ")}</span>}
        title={<span className="transition-colors group-hover:text-accent">{product.theme}</span>}
        price={<Price amount={amount} compareAt={compareAt} compareFirst />}
        extra={colorSwatches}
    />
  );
}
