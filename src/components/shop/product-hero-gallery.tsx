"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/cn";

type ProductHeroGalleryProps = {
  images: string[];
  alt: string;
  transitionKey: string;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  className?: string;
};

export function ProductHeroGallery({
  images,
  alt,
  transitionKey,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  className,
}: ProductHeroGalleryProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex ?? internalIndex;
  const setActiveIndex = onActiveIndexChange ?? setInternalIndex;

  const [displayKey, setDisplayKey] = useState(transitionKey);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [transitionKey, setActiveIndex]);

  useEffect(() => {
    if (transitionKey === displayKey) {
      return;
    }
    setIsAnimating(true);
    const timer = window.setTimeout(() => {
      setDisplayKey(transitionKey);
      setIsAnimating(false);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [transitionKey, displayKey]);

  const heroImage = images[activeIndex] ?? images[0];

  if (!heroImage) {
    return (
      <div
        className={cn(
          "flex aspect-square items-center justify-center rounded-xl border border-muted/20 bg-background text-muted",
          className,
        )}
      >
        No image
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-muted/20 bg-background">
        <Image
          key={`${displayKey}-${heroImage}`}
          src={heroImage}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={cn(
            "object-cover transition-all duration-500 ease-out",
            isAnimating ? "scale-[1.02] opacity-0" : "scale-100 opacity-100 product-image-in",
          )}
          priority
        />
      </div>

      {images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-0.5">
          {images.map((image, index) => (
            <button
              key={`${transitionKey}-${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border transition-all duration-300",
                activeIndex === index
                  ? "border-accent ring-2 ring-accent/30 ring-offset-2"
                  : "border-muted/30 opacity-80 hover:opacity-100",
              )}
            >
              <Image src={image} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
