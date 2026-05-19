"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { Text } from "@/components/ui/text";
import { useProduct } from "@/hooks/use-product-by-slug";
import { getProductDisplayPrice, isProductSoldOut } from "@/lib/utils/product";
import type { Product } from "@/types/product";

import { AddToCartButton } from "./add-to-cart-button";
import { ProductBadges } from "./product-badges";
import { ProductDetailSkeleton } from "./product-detail-skeleton";

type ProductDetailProps = {
  slug: string;
  initialProduct: Product;
};

export function ProductDetail({ slug, initialProduct }: ProductDetailProps) {
  const { data, isPending, isError, error } = useProduct(slug, initialProduct);
  const product = data ?? initialProduct;
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  useEffect(() => {
    if (!product) {
      return;
    }

    if (quantity > product.quantity) {
      setQuantity(Math.max(1, product.quantity));
    }
  }, [product, product?.quantity, quantity]);

  if (isPending && data === undefined) {
    return <ProductDetailSkeleton product={initialProduct} />;
  }

  if (isError) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Could not load product"
          description={error instanceof Error ? error.message : "Please try again later."}
          action={
            <Button href="/shop" variant="secondary">
              Back to shop
            </Button>
          }
        />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Product not found"
          description="This product may have been removed or is unavailable."
          action={
            <Button href="/shop" variant="secondary">
              Back to shop
            </Button>
          }
        />
      </Container>
    );
  }

  const { amount, compareAt } = getProductDisplayPrice(product);
  const soldOut = isProductSoldOut(product);
  const images = product.images.length > 0 ? product.images : [""];
  const selectedImage = images[activeImage] || images[0];

  return (
    <Container className="py-8 sm:py-12">
      <Link
        href="/shop"
        className="mb-4 inline-block text-sm font-medium text-muted hover:text-foreground sm:mb-6"
      >
        ← Back to shop
      </Link>

      <div className="grid gap-6 sm:gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-muted/20 bg-background">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">No image</div>
            )}
          </div>

          {product.images.length > 1 ? (
            <div className="flex gap-3 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border ${
                    activeImage === index ? "border-accent" : "border-muted/30"
                  }`}
                >
                  <Image src={image} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <ProductBadges product={product} />
          <Text variant="small" as="p" className="uppercase tracking-wide">
            {product.type}
          </Text>
          <Text variant="h1" as="h1" className="text-2xl sm:text-3xl">
            {product.name}
          </Text>
          <Price amount={amount} compareAt={compareAt} className="text-xl" />
          <Text
            variant="muted"
            as="p"
            className={soldOut ? "font-medium text-danger" : undefined}
          >
            {soldOut
              ? "This item is currently sold out."
              : `${product.quantity} in stock`}
          </Text>
          <Text variant="body" as="p" className="leading-relaxed">
            {product.description}
          </Text>
          <div className="flex flex-col gap-4 border-t border-muted/20 pt-6 sm:flex-row sm:items-end">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              max={product.quantity}
              disabled={soldOut}
              className="sm:flex-1"
            />
            <AddToCartButton
              product={product}
              quantity={quantity}
              size="lg"
              className="w-full sm:w-auto sm:min-w-[200px]"
            />
          </div>
        </div>
      </div>
    </Container>
  );
}
