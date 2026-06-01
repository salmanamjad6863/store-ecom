"use client";

import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

import { Price } from "@/components/ui/price";
import { prefetchProductBySlug } from "@/lib/queries/prefetch-product";
import { getProductDisplayPrice, isProductSoldOut } from "@/lib/utils/product";
import { addProductToCart } from "@/stores/cart-store";
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
  const { amount, compareAt } = getProductDisplayPrice(product);
  const image = product.images[0];
  const soldOut = isProductSoldOut(product);

  const handleQuickAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (soldOut) {
      return;
    }
    addProductToCart(product, 1);
    toast(`${product.name} added to cart`, "success");
  };

  return (
    <ProductCardShell
      className="h-full"
      image={
        <Link
          href={`/shop/${product.slug}`}
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
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">
              No image
            </div>
          )}
        </Link>
      }
      badge={<ProductCardBadge product={product} />}
      type={<span>{product.type}</span>}
      title={
        <Link href={`/shop/${product.slug}`} className="hover:text-accent">
          {product.name}
        </Link>
      }
      price={<Price amount={amount} compareAt={compareAt} compareFirst />}
      footer={
        soldOut ? undefined : (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex h-12 w-full items-center justify-center bg-deep text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-warm"
          >
            Add to cart
          </button>
        )
      }
    />
  );
}
