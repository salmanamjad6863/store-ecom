"use client";

import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Price } from "@/components/ui/price";
import { prefetchProductById } from "@/lib/queries/prefetch-product";
import { preloadImage } from "@/lib/utils/preload-image";
import {
  getColorById,
  resolveListingDisplayColor,
} from "@/lib/utils/product-colors";
import { getProductDisplayPrice, isProductSoldOut } from "@/lib/utils/product";
import { cn } from "@/lib/utils/cn";
import { useProductPreview } from "@/providers/product-preview-provider";
import type { Product } from "@/types/product";
import type { ProductColor } from "@/types/product-color";

import { ProductCardBadge } from "./product-card-badge";
import { ProductCardShell } from "./product-card-shell";

type ProductCardProps = {
  product: Product;
};

function getColorCardImage(product: Product, color: ProductColor): string {
  return (
    color.heroImage ??
    color.images[0] ??
    product.heroImage ??
    product.images[0] ??
    ""
  );
}

function ProductCardImage({
  productId,
  src,
  alt,
  soldOut,
}: {
  productId: string;
  src: string;
  alt: string;
  soldOut: boolean;
}) {
  const [shownSrc, setShownSrc] = useState(src);

  useEffect(() => {
    setShownSrc(src);
  }, [productId]);

  useEffect(() => {
    if (!src || src === shownSrc) {
      return;
    }

    let cancelled = false;
    const img = new window.Image();
    img.decoding = "async";
    img.src = src;

    const commit = () => {
      if (!cancelled) {
        setShownSrc(src);
      }
    };

    if (img.complete) {
      commit();
    } else {
      img.onload = commit;
    }

    return () => {
      cancelled = true;
      img.onload = null;
    };
  }, [src, shownSrc]);

  if (!shownSrc) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted">
        No image
      </div>
    );
  }

  return (
    <Image
      src={shownSrc}
      alt={alt}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className={cn(
        "object-contain object-center",
        "[@media(hover:hover)]:transition-transform [@media(hover:hover)]:duration-500 [@media(hover:hover)]:group-hover:scale-[1.03]",
        soldOut && "opacity-80 saturate-[0.85]",
      )}
      unoptimized
    />
  );
}

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

  useEffect(() => {
    for (const color of product.colors) {
      preloadImage(getColorCardImage(product, color));
    }
  }, [product]);

  const { amount, compareAt } = getProductDisplayPrice(product);
  const image = getColorCardImage(product, displayColor);

  const themeLine = displayColor.themeLine?.trim();

  const handlePrefetchPreview = () => {
    void prefetchProductById(queryClient, product.id);
    preloadImage(image);
    for (const color of product.colors) {
      preloadImage(getColorCardImage(product, color));
    }
  };

  const handleOpenPreview = () => {
    preloadImage(image);
    handlePrefetchPreview();
    openPreview(product, {
      initialColorId: displayColor.colorId,
      initialImage: image,
    });
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
            onPointerEnter={() => preloadImage(getColorCardImage(product, color))}
            onTouchStart={() => preloadImage(getColorCardImage(product, color))}
            onClick={() => {
              preloadImage(getColorCardImage(product, color));
              setSelectedColorId(color.colorId);
            }}
            className={cn(
              "relative h-5 w-5 rounded-full border transition-all hover:scale-110 sm:h-7 sm:w-7",
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
      onPointerEnter={handlePrefetchPreview}
      onTouchStart={handlePrefetchPreview}
      onFocus={handlePrefetchPreview}
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
          image ? (
            <ProductCardImage
              productId={product.id}
              src={image}
              alt={product.theme}
              soldOut={isProductSoldOut(product)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">
              No image
            </div>
          )
        }
        badge={<ProductCardBadge product={product} />}
        meta={themeLine ? <span>{themeLine}</span> : undefined}
        title={<span className="transition-colors group-hover:text-accent">{product.theme}</span>}
        price={<Price amount={amount} compareAt={compareAt} compareFirst />}
        extra={colorSwatches}
    />
  );
}
