"use client";

import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

import { Price } from "@/components/ui/price";
import { prefetchProductBySlug } from "@/lib/queries/prefetch-product";
import { cn } from "@/lib/utils/cn";
import { getProductDisplayPrice } from "@/lib/utils/product";
import type { Product } from "@/types/product";

import { ProductBadges } from "./product-badges";
import { ProductCardShell } from "./product-card-shell";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const queryClient = useQueryClient();
  const { amount, compareAt } = getProductDisplayPrice(product);
  const image = product.images[0];

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block h-full"
      onMouseEnter={() => {
        void prefetchProductBySlug(queryClient, product.slug);
      }}
      onFocus={() => {
        void prefetchProductBySlug(queryClient, product.slug);
      }}
    >
      <ProductCardShell
        className="hover:shadow-md"
        image={
          image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">
              No image
            </div>
          )
        }
        badge={<ProductBadges product={product} />}
        type={<span className="text-muted">{product.type}</span>}
        title={<span>{product.name}</span>}
        price={
          <Price
            amount={amount}
            compareAt={compareAt}
            className={cn(
              compareAt !== undefined && compareAt > amount
                ? "flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-2"
                : undefined,
            )}
          />
        }
      />
    </Link>
  );
}
