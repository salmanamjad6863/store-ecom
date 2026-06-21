"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GatedProductImage } from "@/components/ui/gated-product-image";
import { Price } from "@/components/ui/price";
import { useInView } from "@/hooks/use-in-view";
import { prefetchProductById } from "@/lib/queries/prefetch-product";
import { getListingImagePreloadUrl } from "@/lib/utils/listing-image-url";
import { buildProductImageAlt } from "@/lib/seo/shop-seo";
import { preloadImage } from "@/lib/utils/preload-image";
import {
  getColorById,
  getColorsForModel,
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
  modelId?: string;
  priority?: boolean;
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

function preloadListingImage(rawSrc: string) {
  const url = getListingImagePreloadUrl(rawSrc);
  if (url) {
    preloadImage(url);
  }
}

export function ProductCard({ product, modelId, priority = false }: ProductCardProps) {
  const queryClient = useQueryClient();
  const { openPreview } = useProductPreview();
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { immediate: priority });
  const shouldLoadImage = priority || inView;
  const othersPreloadedRef = useRef(false);

  const colors = useMemo(() => getColorsForModel(product, modelId), [product, modelId]);
  const isMultiColor = colors.length > 1;

  const initialColor = useMemo(
    () => resolveListingDisplayColor(product, undefined, modelId),
    [product, modelId],
  );

  const [selectedColorId, setSelectedColorId] = useState(initialColor.colorId);
  const [displayColor, setDisplayColor] = useState(initialColor);

  useEffect(() => {
    const next = resolveListingDisplayColor(product, undefined, modelId);
    setSelectedColorId(next.colorId);
    setDisplayColor(next);
  }, [product.id, modelId]);

  useEffect(() => {
    othersPreloadedRef.current = false;
  }, [product.id, modelId]);

  useEffect(() => {
    const inScope = colors.some((color) => color.colorId === selectedColorId);
    if (!inScope) {
      return;
    }

    const preferred = getColorById(product, selectedColorId);
    if (preferred && (preferred.totalQuantity ?? 0) > 0) {
      setDisplayColor(preferred);
      return;
    }
    const fallback = resolveListingDisplayColor(product, selectedColorId, modelId);
    setDisplayColor(fallback);
    if (fallback.colorId !== selectedColorId) {
      setSelectedColorId(fallback.colorId);
    }
  }, [product, selectedColorId, modelId, colors]);

  const { amount, compareAt } = getProductDisplayPrice(product);
  const image = getColorCardImage(product, displayColor);

  const themeLine = displayColor.themeLine?.trim();

  const preloadOtherColors = useCallback(() => {
    if (othersPreloadedRef.current) {
      return;
    }
    othersPreloadedRef.current = true;

    const run = () => {
      for (const color of colors) {
        if (color.colorId === initialColor.colorId) {
          continue;
        }
        preloadListingImage(getColorCardImage(product, color));
      }
    };

    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(run, { timeout: 2500 });
    } else {
      window.setTimeout(run, 400);
    }
  }, [colors, initialColor.colorId, product]);

  const handlePrimaryReady = useCallback(() => {
    preloadOtherColors();
  }, [preloadOtherColors]);

  const handlePrefetchPreview = () => {
    void prefetchProductById(queryClient, product.id);
    preloadListingImage(image);
    for (const color of colors) {
      preloadListingImage(getColorCardImage(product, color));
    }
  };

  const handleOpenPreview = () => {
    preloadListingImage(image);
    handlePrefetchPreview();
    openPreview(product, {
      initialColorId: displayColor.colorId,
      initialImage: image,
      initialModelId: modelId,
    });
  };

  const colorSwatches = isMultiColor ? (
    <div
      className="flex flex-wrap justify-center gap-2"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {colors.map((color) => {
        const isActive = color.colorId === selectedColorId;
        const colorSoldOut = (color.totalQuantity ?? 0) <= 0;

        return (
          <button
            key={color.id}
            type="button"
            title={colorSoldOut ? `${color.colorName} — sold out` : color.colorName}
            aria-label={`${color.colorName}${isActive ? " (selected)" : ""}`}
            onPointerEnter={() => preloadListingImage(getColorCardImage(product, color))}
            onTouchStart={() => preloadListingImage(getColorCardImage(product, color))}
            onClick={() => {
              preloadListingImage(getColorCardImage(product, color));
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
    <div ref={cardRef} className="h-full">
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
            <GatedProductImage
              src={image}
              alt={buildProductImageAlt(product.theme, displayColor.colorName)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              enabled={shouldLoadImage}
              soldOut={isProductSoldOut(product)}
              onReady={handlePrimaryReady}
              imageClassName="[@media(hover:hover)]:transition-transform [@media(hover:hover)]:duration-500 [@media(hover:hover)]:group-hover:scale-[1.03]"
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
    </div>
  );
}
