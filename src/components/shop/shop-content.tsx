"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useProducts, useProductTypes } from "@/hooks/use-products";

import { ProductFilters } from "./product-filters";
import { ProductGrid } from "./product-grid";

function ShopContentInner() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? undefined;

  const { data: products, isLoading, isError, error } = useProducts({ type });
  const { data: types = [] } = useProductTypes();

  return (
    <Container className="py-10 sm:py-12">
      <div className="mb-8 flex flex-col gap-4">
        <Text variant="h1" as="h1">
          Shop
        </Text>
        <Text variant="muted" as="p">
          Browse our collection and add items to your cart.
        </Text>
      </div>

      <ProductFilters types={types} />

      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : null}

        {isError ? (
          <EmptyState
            title="Could not load products"
            description={error instanceof Error ? error.message : "Please try again later."}
          />
        ) : null}

        {!isLoading && !isError && products && products.length > 0 ? (
          <ProductGrid products={products} />
        ) : null}

        {!isLoading && !isError && products?.length === 0 ? (
          <EmptyState
            title="No products found"
            description={
              type
                ? `No products in "${type}". Try another category.`
                : "Check back soon for new items."
            }
          />
        ) : null}
      </div>
    </Container>
  );
}

export function ShopContent() {
  return (
    <Suspense
      fallback={
        <Container className="flex justify-center py-16">
          <Spinner size="lg" />
        </Container>
      }
    >
      <ShopContentInner />
    </Suspense>
  );
}
