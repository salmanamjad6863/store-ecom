"use client";

import Image from "next/image";
import { useMemo } from "react";

import { getCartImageDelivery } from "@/lib/utils/listing-image-url";

type CartThumbnailImageProps = {
  src: string;
  alt: string;
};

export function CartThumbnailImage({ src, alt }: CartThumbnailImageProps) {
  const delivery = useMemo(() => getCartImageDelivery(src), [src]);

  if (!delivery.src) {
    return (
      <div className="flex h-full items-center justify-center text-[10px] text-muted">
        No image
      </div>
    );
  }

  return (
    <Image
      src={delivery.src}
      alt={alt}
      fill
      sizes="84px"
      unoptimized={delivery.unoptimized}
      className="object-contain p-1"
    />
  );
}
