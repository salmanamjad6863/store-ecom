"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
import { useProducts } from "@/hooks/use-products";
import { cn } from "@/lib/utils/cn";

import { ProductGrid } from "./product-grid";
import { ProductGridSkeleton } from "./product-grid-skeleton";

export function FeaturedProducts() {
  const { data: products, isPending, isError, isFetching } = useProducts();
  const featured = products?.slice(0, 4) ?? [];
  const showSkeleton = isPending && !products;

  return (
    <section className="border-t border-muted/20 bg-surface py-10 sm:py-16">
      <Container className="flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Text variant="h2" as="h2">
              Featured products
            </Text>
            <Text variant="muted" as="p">
              Hand-picked items from our shop.
            </Text>
          </div>
          <Button href="/shop" variant="secondary">
            View all
          </Button>
        </div>

        {showSkeleton ? <ProductGridSkeleton count={4} className="lg:grid-cols-4" /> : null}

        {isError ? (
          <EmptyState
            title="Products unavailable"
            description="We could not load featured products right now."
            action={
              <Button href="/shop" variant="secondary">
                Go to shop
              </Button>
            }
          />
        ) : null}

        {!showSkeleton && !isError && featured.length > 0 ? (
          <div
            className={cn("transition-opacity duration-200", isFetching && "opacity-60")}
          >
            <ProductGrid products={featured} />
          </div>
        ) : null}

        {!showSkeleton && !isError && featured.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Add products in Firebase to see them here."
            action={
              <Button href="/shop" variant="secondary">
                Browse shop
              </Button>
            }
          />
        ) : null}
      </Container>
    </section>
  );
}
