"use client";

import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useMemo } from "react";

import { env } from "@/lib/env";
import { prefetchProductById } from "@/lib/queries/prefetch-product";
import { preloadImage } from "@/lib/utils/preload-image";
import { formatCurrency } from "@/lib/utils/format";
import { getProductDisplayPrice } from "@/lib/utils/product";
import { resolveListingDisplayColor } from "@/lib/utils/product-colors";
import { cn } from "@/lib/utils/cn";
import { useProductPreview } from "@/providers/product-preview-provider";
import type { Product } from "@/types/product";

type HeroFeaturedCardProps = {
  product: Product;
  colorId?: string;
  index: number;
  raised?: boolean;
};

function getProductImage(product: Product, colorId?: string): string {
  const color = resolveListingDisplayColor(product, colorId);
  return color.heroImage ?? color.images[0] ?? product.heroImage ?? product.images[0] ?? "";
}

export function HeroFeaturedCard({ product, colorId, index, raised }: HeroFeaturedCardProps) {
  const queryClient = useQueryClient();
  const { openPreview } = useProductPreview();

  const displayColor = useMemo(
    () => resolveListingDisplayColor(product, colorId),
    [product, colorId],
  );
  const { amount } = getProductDisplayPrice(product);
  const image = getProductImage(product, displayColor.colorId);
  const label = product.theme || product.name;

  const handlePrefetchPreview = () => {
    void prefetchProductById(queryClient, product.id);
    preloadImage(image);
  };

  const handleOpenPreview = () => {
    preloadImage(image);
    handlePrefetchPreview();
    openPreview(product, {
      initialColorId: displayColor.colorId,
      initialImage: image,
    });
  };

  return (
    <div
      className={cn("animate-hero-card-in", raised && "-translate-y-4 sm:-translate-y-5")}
      style={{ animationDelay: `${0.12 + index * 0.14}s` }}
    >
      <button
        type="button"
        onPointerEnter={handlePrefetchPreview}
        onTouchStart={handlePrefetchPreview}
        onFocus={handlePrefetchPreview}
        onClick={handleOpenPreview}
        className={cn(
          "hero-featured-card group block w-full cursor-pointer rounded-2xl bg-white p-3 text-left",
          "shadow-[0_20px_60px_rgba(43,26,20,0.11)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2",
          "sm:p-3.5",
        )}
        aria-label={`Preview ${label}`}
      >
        <div className="hero-featured-card__media relative mb-2 aspect-[9/16] rounded-xl bg-soft p-2 sm:p-3">
          <div className="hero-featured-card__image relative h-full w-full">
            {image ? (
              <Image
                src={image}
                alt={label}
                fill
                sizes="(max-width: 640px) 28vw, 140px"
                className="object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted">—</div>
            )}
          </div>
        </div>

        <p className="hero-featured-card__label truncate text-center text-[10px] font-medium uppercase tracking-wider text-warm sm:text-[11px]">
          {label}
        </p>
        <p className="hero-featured-card__price text-center text-xs text-deep/80">
          {formatCurrency(amount, env.currency.code, env.currency.locale)}
        </p>
      </button>
    </div>
  );
}

export function HeroProductCardSkeleton({ raised }: { raised?: boolean }) {
  return (
    <div className={cn(raised && "-translate-y-4 sm:-translate-y-5")}>
      <div
        className={cn(
          "animate-pulse rounded-2xl bg-white/80 p-3 shadow-lg sm:p-3.5",
          raised && "opacity-90",
        )}
      >
        <div className="mb-2 aspect-[9/16] rounded-xl bg-blush/40 p-3 sm:p-3.5">
          <div className="h-full w-full rounded-lg bg-blush/30" />
        </div>
        <div className="mx-auto mb-1.5 h-2 w-16 rounded bg-warm/20" />
        <div className="mx-auto h-2 w-10 rounded bg-warm/15" />
      </div>
    </div>
  );
}
