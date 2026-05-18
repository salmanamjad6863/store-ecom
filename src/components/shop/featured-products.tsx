"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useProducts } from "@/hooks/use-products";

import { ProductGrid } from "./product-grid";

export function FeaturedProducts() {
  const { data: products, isLoading, isError } = useProducts();
  const featured = products?.slice(0, 4) ?? [];

  return (
    <section className="border-t border-muted/20 bg-surface py-16">
      <Container className="flex flex-col gap-8">
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

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : null}

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

        {!isLoading && !isError && featured.length > 0 ? (
          <ProductGrid products={featured} />
        ) : null}

        {!isLoading && !isError && featured.length === 0 ? (
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
