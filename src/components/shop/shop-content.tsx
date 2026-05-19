"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
import { useProducts, useProductTypes } from "@/hooks/use-products";
import { filterAndSortProducts } from "@/lib/shop/filter-products";
import { cn } from "@/lib/utils/cn";

import { ProductFilters } from "./product-filters";
import { ProductGrid } from "./product-grid";
import { ProductGridSkeleton } from "./product-grid-skeleton";
import { ShopToolbar, type ShopSort } from "./shop-toolbar";

function ShopContentInner() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? undefined;
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ShopSort>("newest");

  const { data: products, isPending, isError, error, isFetching } = useProducts({ type });
  const { data: types = [] } = useProductTypes();

  const displayedProducts = useMemo(
    () => filterAndSortProducts(products ?? [], search, sort),
    [products, search, sort],
  );

  const showSkeleton = isPending && !products;

  return (
    <Container className="py-8 sm:py-12">
      <header className="mb-6 flex flex-col gap-2 sm:mb-8 sm:gap-4">
        <Text variant="h1" as="h1">
          Shop
        </Text>
        <Text variant="muted" as="p">
          Browse our collection and add items to your cart.
        </Text>
      </header>

      <ProductFilters types={types} />
      <ShopToolbar search={search} onSearchChange={setSearch} sort={sort} onSortChange={setSort} />

      <section className="mt-6 sm:mt-8">
        {showSkeleton ? <ProductGridSkeleton /> : null}

        {isError ? (
          <EmptyState
            title="Could not load products"
            description={error instanceof Error ? error.message : "Please try again later."}
          />
        ) : null}

        {!showSkeleton && !isError && products && products.length > 0 && displayedProducts.length > 0 ? (
          <div
            className={cn(
              "transition-opacity duration-200",
              isFetching && "opacity-60",
            )}
          >
            <ProductGrid products={displayedProducts} />
          </div>
        ) : null}

        {!showSkeleton && !isError && products && products.length > 0 && displayedProducts.length === 0 ? (
          <EmptyState
            title="No matching products"
            description="Try a different search or clear your filters."
            action={
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-sm font-medium text-accent hover:underline"
              >
                Clear search
              </button>
            }
          />
        ) : null}

        {!showSkeleton && !isError && products?.length === 0 ? (
          <EmptyState
            title="No products found"
            description={
              type
                ? `No products in "${type}". Try another category.`
                : "Check back soon for new items."
            }
          />
        ) : null}
      </section>
    </Container>
  );
}

export function ShopContent() {
  return (
    <Suspense
      fallback={
        <Container className="py-8 sm:py-12">
          <ProductGridSkeleton />
        </Container>
      }
    >
      <ShopContentInner />
    </Suspense>
  );
}
