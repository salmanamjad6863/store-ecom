"use client";

import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Price } from "@/components/ui/price";
import { prefetchProductBySlug } from "@/lib/queries/prefetch-product";
import {
  getColorById,
  resolveListingDisplayColor,
} from "@/lib/utils/product-colors";
import { getProductDisplayPrice, isProductSoldOut } from "@/lib/utils/product";
import { productHasVariants } from "@/lib/utils/variant";
import { cn } from "@/lib/utils/cn";
import { addDefaultVariantToCart } from "@/stores/cart-store";
import { useToast } from "@/providers/toast-provider";
import type { Product } from "@/types/product";

import { ProductCardBadge } from "./product-card-badge";
import { ProductCardShell } from "./product-card-shell";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
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
  const soldOut = isProductSoldOut(product);
  const hasVariants = productHasVariants(product);

  const modelCount =
    displayColor.availableModelIds && displayColor.availableModelIds.length > 0
      ? `${displayColor.availableModelIds.length} models`
      : product.availableModelIds && product.availableModelIds.length > 0
        ? `${product.availableModelIds.length} models`
        : null;

  const handleQuickAdd = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (soldOut) {
      return;
    }

    if (hasVariants) {
      const { fetchProductWithVariantsBySlug } = await import("@/lib/queries/products");
      const fullProduct = await fetchProductWithVariantsBySlug(product.slug);
      if (fullProduct?.variants.length) {
        addDefaultVariantToCart(fullProduct, fullProduct.variants, displayColor.colorId, 1);
        toast(`${product.theme} (${displayColor.colorName}) added to cart`, "success");
        return;
      }
    }

    const { addVariantToCart } = await import("@/stores/cart-store");
    addVariantToCart(product, undefined, 1, displayColor.colorId);
    toast(`${product.name} added to cart`, "success");
  };

  const colorSwatches = isMultiColor ? (
    <div className="mt-3 flex flex-wrap justify-center gap-2 px-1">
      {product.colors.map((color) => {
        const isActive = color.colorId === selectedColorId;
        const colorSoldOut = (color.totalQuantity ?? 0) <= 0;

        return (
          <button
            key={color.id}
            type="button"
            title={colorSoldOut ? `${color.colorName} — sold out` : color.colorName}
            aria-label={`${color.colorName}${isActive ? " (selected)" : ""}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setSelectedColorId(color.colorId);
            }}
            className={cn(
              "relative h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
              isActive ? "border-accent ring-2 ring-accent/30 ring-offset-1" : "border-white/80",
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

  const productHref =
    isMultiColor && displayColor.colorId
      ? `/shop/${product.slug}?color=${encodeURIComponent(displayColor.colorId)}`
      : `/shop/${product.slug}`;

  return (
    <ProductCardShell
      className="h-full"
      image={
        <Link
          href={productHref}
          className="absolute inset-0 block"
          onMouseEnter={() => {
            void prefetchProductBySlug(queryClient, product.slug);
          }}
          onFocus={() => {
            void prefetchProductBySlug(queryClient, product.slug);
          }}
        >
          {image ? (
            <Image
              key={`${product.id}-${displayColor.colorId}`}
              src={image}
              alt={product.theme}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">
              No image
            </div>
          )}
        </Link>
      }
      badge={<ProductCardBadge product={product} />}
      type={
        <span>
          {product.theme}
          {isMultiColor && displayColor.colorName ? ` · ${displayColor.colorName}` : null}
          {modelCount ? ` · ${modelCount}` : ""}
        </span>
      }
      title={
        <Link href={productHref} className="hover:text-accent">
          {product.theme}
        </Link>
      }
      price={
        <div className="flex flex-col items-center">
          <Price amount={amount} compareAt={compareAt} compareFirst />
          {colorSwatches}
        </div>
      }
      footer={
        soldOut ? undefined : (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex h-12 w-full items-center justify-center bg-deep text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-warm"
          >
            {hasVariants ? "Quick add" : "Add to cart"}
          </button>
        )
      }
    />
  );
}
