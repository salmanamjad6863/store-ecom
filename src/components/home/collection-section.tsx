"use client";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useProducts } from "@/hooks/use-products";
import { cn } from "@/lib/utils/cn";

import { ProductGrid } from "../shop/product-grid";
import { ProductGridSkeleton } from "../shop/product-grid-skeleton";

type CollectionSectionProps = {
  limit?: number;
  showViewAll?: boolean;
  className?: string;
};

export function CollectionSection({
  limit = 4,
  showViewAll = true,
  className,
}: CollectionSectionProps) {
  const { data: products, isPending, isError, isFetching } = useProducts();
  const items = products?.slice(0, limit) ?? [];
  const showSkeleton = isPending && !products;

  return (
    <section className={cn("bg-soft px-4 py-14 sm:px-6 sm:py-20 lg:px-10 lg:py-24", className)}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="The Collection"
            title={
              <>
                Designed to be <em className="italic text-accent">irresistible</em>
              </>
            }
            lead="Each drop is a universe. Collect them all."
          />
          {showViewAll ? (
            <Button href="/shop" variant="secondary" className="shrink-0 self-start sm:self-auto">
              View all
            </Button>
          ) : null}
        </div>

        {showSkeleton ? <ProductGridSkeleton count={limit} /> : null}

        {isError ? (
          <EmptyState
            title="Products unavailable"
            description="We could not load products right now."
            action={
              <Button href="/shop" variant="secondary">
                Try shop
              </Button>
            }
          />
        ) : null}

        {!showSkeleton && !isError && items.length > 0 ? (
          <div className={cn("transition-opacity duration-200", isFetching && "opacity-60")}>
            <ProductGrid products={items} />
          </div>
        ) : null}

        {!showSkeleton && !isError && items.length === 0 ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
