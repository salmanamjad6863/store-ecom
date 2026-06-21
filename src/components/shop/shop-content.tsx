"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { useShopCatalog } from "@/hooks/use-shop-catalog";
import { filterAndSortProducts } from "@/lib/shop/filter-products";
import { getActiveModelIdFromPath } from "@/lib/seo/collections";
import type { Product } from "@/types/product";

import { ProductGrid } from "./product-grid";
import { ProductGridSkeleton } from "./product-grid-skeleton";
import { ShopControls } from "./shop-controls";
import type { ShopSort } from "./shop-toolbar";

export type ShopPageHeading = {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
};

type ShopContentInnerProps = {
  skeletonCount?: number;
  initialProducts?: Product[];
  fixedModelId?: string;
  theme?: string;
  heading?: ShopPageHeading;
  /** Screen-reader H1 for SEO — does not change visible layout. */
  srTitle?: string;
};

function ShopContentInner({
  skeletonCount: skeletonCountHint,
  initialProducts,
  fixedModelId,
  theme,
  heading,
  srTitle,
}: ShopContentInnerProps) {
  const pathname = usePathname();
  const routeModelId = fixedModelId ?? getActiveModelIdFromPath(pathname);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ShopSort>("newest");

  const {
    modelId,
    products: resolvedProducts,
    showSkeleton,
    isError,
    skeletonCount,
  } = useShopCatalog({
    routeModelId,
    routeTheme: theme,
    initialProducts,
    skeletonCountHint,
  });

  const displayedProducts = useMemo(
    () => filterAndSortProducts(resolvedProducts ?? [], search, sort),
    [resolvedProducts, search, sort],
  );

  const resolvedHeading = heading ?? {
    eyebrow: "The Collection",
    title: (
      <>
        Designed to be <em className="italic text-accent">irresistible</em>
      </>
    ),
    lead: "Browse by iPhone model or design. Each color is its own product.",
  };

  return (
    <div className="bg-soft">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <header className="border-b border-deep/10 pb-8 sm:pb-10">
          {srTitle ? <h1 className="sr-only">{srTitle}</h1> : null}
          <SectionHeading
            eyebrow={resolvedHeading.eyebrow}
            title={resolvedHeading.title}
            lead={resolvedHeading.lead}
          />
        </header>

        <ShopControls
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
        />

        <section className="mt-8 sm:mt-10" aria-label="Products">
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

          {!showSkeleton && !isError && resolvedProducts && resolvedProducts.length > 0 && displayedProducts.length > 0 ? (
            <ProductGrid products={displayedProducts} modelId={modelId} />
          ) : null}

          {!showSkeleton && !isError && resolvedProducts && resolvedProducts.length > 0 && displayedProducts.length === 0 ? (
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

          {!showSkeleton && !isError && resolvedProducts?.length === 0 ? (
            <EmptyState
              title="The drop is coming soon"
              description={
                modelId
                  ? "No covers for this iPhone model yet. Browse all models instead."
                  : "New covers arrive every Friday — check back soon."
              }
              className="border-deep/15 bg-cream/50"
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}

type ShopContentProps = ShopContentInnerProps;

export function ShopContent(props: ShopContentProps) {
  return <ShopContentInner {...props} />;
}
