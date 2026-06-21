"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { useProductSkeletonCount } from "@/hooks/use-product-skeleton-count";
import { useProducts } from "@/hooks/use-products";
import { filterAndSortProducts } from "@/lib/shop/filter-products";
import { cn } from "@/lib/utils/cn";

import { ProductGrid } from "./product-grid";
import { ProductGridSkeleton } from "./product-grid-skeleton";
import { ShopControls } from "./shop-controls";
import type { ShopSort } from "./shop-toolbar";

type ShopContentInnerProps = {
  skeletonCount?: number;
};

function ShopContentInner({ skeletonCount: skeletonCountHint }: ShopContentInnerProps) {
  const searchParams = useSearchParams();
  const modelId = searchParams.get("model") ?? undefined;
  const theme = searchParams.get("theme") ?? undefined;
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ShopSort>("newest");

  const { data: products, isPending, isError, isFetching } = useProducts({ modelId, theme });
  const skeletonCount = useProductSkeletonCount({
    products,
    modelId,
    theme,
    fallbackCount: skeletonCountHint,
  });
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
            lead="Browse by iPhone model or design. Each color is its own product."
          />
        </header>

        <ShopControls
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
        />

        <section className="mt-8 sm:mt-10">
          {showSkeleton && skeletonCount > 0 ? (
            <ProductGridSkeleton count={skeletonCount} />
          ) : null}

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
                isFetching && products && "opacity-60",
              )}
            >
              <ProductGrid products={displayedProducts} modelId={modelId} />
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
                modelId
                  ? "No cases for this iPhone model yet. Browse all models instead."
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

type ShopContentProps = {
  skeletonCount?: number;
};

export function ShopContent({ skeletonCount }: ShopContentProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-soft px-4 py-10 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            {skeletonCount && skeletonCount > 0 ? (
              <ProductGridSkeleton count={skeletonCount} />
            ) : null}
          </div>
        </div>
      }
    >
      <ShopContentInner skeletonCount={skeletonCount} />
    </Suspense>
  );
}
