"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useProduct } from "@/hooks/use-product-by-slug";
import { getProductDisplayPrice, isProductSoldOut } from "@/lib/utils/product";

import { AddToCartButton } from "./add-to-cart-button";
import { ProductBadges } from "./product-badges";

export function ProductDetail() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { data: product, isLoading, isError, error } = useProduct(slug);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <Container className="flex justify-center py-16">
        <Spinner size="lg" />
      </Container>
    );
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
    <Container className="py-10 sm:py-12">
      <Link
        href="/shop"
        className="mb-6 inline-block text-sm font-medium text-muted hover:text-foreground"
      >
        ← Back to shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
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
          <Text variant="h1" as="h1">
            {product.name}
          </Text>
          <Price amount={amount} compareAt={compareAt} className="text-xl" />
          <Text variant="muted" as="p">
            {soldOut
              ? "This item is currently sold out."
              : `${product.quantity} in stock`}
          </Text>
          <Text variant="body" as="p" className="leading-relaxed">
            {product.description}
          </Text>
          <AddToCartButton product={product} size="lg" className="w-full sm:w-auto" />
        </div>
      </div>
    </Container>
  );
}
