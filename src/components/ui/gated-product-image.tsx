"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";

import { useGatedImageSrc, useImageLoaded } from "@/hooks/use-gated-image-src";
import { getListingImageDelivery } from "@/lib/utils/listing-image-url";
import { cn } from "@/lib/utils/cn";

import { Skeleton } from "./skeleton";

type GatedProductImageProps = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** When false, skeleton only — no fetch until enabled. */
  enabled?: boolean;
  className?: string;
  imageClassName?: string;
  soldOut?: boolean;
  onReady?: () => void;
};

function ImageUnavailable() {
  return (
    <div className="flex h-full items-center justify-center text-xs text-muted">
      Image unavailable
    </div>
  );
}

function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn("absolute inset-0 h-full w-full rounded-lg", className)}
      aria-hidden
    />
  );
}

export function GatedProductImage({
  src,
  alt,
  sizes,
  priority = false,
  enabled = true,
  className,
  imageClassName,
  soldOut = false,
  onReady,
}: GatedProductImageProps) {
  const delivery = useMemo(() => getListingImageDelivery(src), [src]);
  const gated = useGatedImageSrc(delivery.src, {
    enabled: enabled && delivery.usePreloadGate,
  });
  const direct = useImageLoaded(
    enabled && !delivery.usePreloadGate ? delivery.src : undefined,
  );
  const readyNotifiedRef = useRef<string | null>(null);

  const isReady = delivery.usePreloadGate
    ? gated.status === "ready"
    : direct.isLoaded;

  useEffect(() => {
    if (!enabled || !isReady || !src) {
      return;
    }

    if (readyNotifiedRef.current === src) {
      return;
    }

    readyNotifiedRef.current = src;
    onReady?.();
  }, [enabled, isReady, onReady, src]);

  if (!delivery.src) {
    return (
      <div className={cn("relative h-full w-full", className)}>
        <div className="flex h-full items-center justify-center text-xs text-muted">No image</div>
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className={cn("relative h-full w-full", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (delivery.usePreloadGate) {
    if (gated.status === "error") {
      return (
        <div className={cn("relative h-full w-full", className)}>
          <ImageUnavailable />
        </div>
      );
    }

    return (
      <div className={cn("relative h-full w-full", className)}>
        {gated.status !== "ready" ? <LoadingSkeleton /> : null}
        {gated.displaySrc ? (
          <Image
            src={gated.displaySrc}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            unoptimized
            className={cn(
              "object-contain object-center transition-opacity duration-300",
              gated.status === "ready"
                ? soldOut
                  ? "opacity-80 saturate-[0.85]"
                  : "opacity-100"
                : "opacity-0",
              imageClassName,
            )}
          />
        ) : null}
      </div>
    );
  }

  const showSkeleton = !direct.isLoaded && !direct.hasError;

  return (
    <div className={cn("relative h-full w-full", className)}>
      {showSkeleton ? <LoadingSkeleton /> : null}
      {direct.hasError ? (
        <ImageUnavailable />
      ) : (
        <Image
          ref={direct.imgRef}
          src={delivery.src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          onLoad={direct.markLoaded}
          onError={direct.markError}
          className={cn(
            "object-contain object-center transition-opacity duration-300",
            direct.isLoaded
              ? soldOut
                ? "opacity-80 saturate-[0.85]"
                : "opacity-100"
              : "opacity-0",
            imageClassName,
          )}
        />
      )}
    </div>
  );
}
