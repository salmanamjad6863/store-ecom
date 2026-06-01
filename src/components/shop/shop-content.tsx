"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { useProducts, useProductTypes } from "@/hooks/use-products";
import { filterAndSortProducts } from "@/lib/shop/filter-products";
import { cn } from "@/lib/utils/cn";

import { ProductGrid } from "./product-grid";
import { ProductGridSkeleton } from "./product-grid-skeleton";
import { ShopControls } from "./shop-controls";
import type { ShopSort } from "./shop-toolbar";

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
    <div className="bg-soft">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <header className="border-b border-deep/10 pb-8 sm:pb-10">
          <SectionHeading
            eyebrow="The Collection"
            title={
              <>
                Designed to be <em className="italic text-accent">irresistible</em>
              </>
            }
            lead="Each drop is a universe. Collect them all."
          />
        </header>

        <ShopControls
          types={types}
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
        />

        <section className="mt-8 sm:mt-10">
          {showSkeleton ? <ProductGridSkeleton /> : null}

          {isError ? (
            <EmptyState
              title="Could not load products"
              description="We could not reach the collection right now. Please try again in a moment."
              className="border-deep/15 bg-cream/50"
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
              title="Nothing matched your search"
              description="Try another keyword or browse all pieces in the collection."
              className="border-deep/15 bg-cream/50"
              action={
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent transition-colors hover:text-warm"
                >
                  Clear search
                </button>
              }
            />
          ) : null}

          {!showSkeleton && !isError && products?.length === 0 ? (
            <EmptyState
              title="The drop is coming soon"
              description={
                type
                  ? `No pieces in “${type}” yet. Explore the full collection instead.`
                  : "New cases arrive every Friday — check back soon."
              }
              className="border-deep/15 bg-cream/50"
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}

export function ShopContent() {
  return (
    <Suspense
      fallback={
        <div className="bg-soft px-4 py-10 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <ProductGridSkeleton />
          </div>
        </div>
      }
    >
      <ShopContentInner />
    </Suspense>
  );
}
