import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductDetailSkeletonLayout } from "@/lib/skeleton/product-layout";
import type { Product } from "@/types/product";

type ProductDetailSkeletonProps = {
  product?: Product;
};

export function ProductDetailSkeleton({ product }: ProductDetailSkeletonProps) {
  const layout = getProductDetailSkeletonLayout(product);

  return (
    <Container className="py-8 sm:py-12" aria-busy="true" aria-label="Loading product">
      <span className="mb-4 inline-block text-sm font-medium sm:mb-6">
        <Skeleton className="h-5 w-28" />
      </span>

      <div className="grid gap-6 sm:gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-muted/20 bg-background">
            <Skeleton className="absolute inset-0 rounded-xl" />
          </div>

          {layout.showThumbnails ? (
            <div className="flex gap-3 overflow-x-auto">
              {Array.from({ length: layout.thumbnailCount }, (_, index) => (
                <Skeleton key={index} className="h-20 w-20 shrink-0 rounded-lg" />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          {layout.showBadge ? (
            <Skeleton className="h-6 w-20 rounded-full" />
          ) : null}

          <Skeleton className="h-4 w-24" />

          <div
            className={
              layout.titleLines > 1
                ? "text-2xl font-semibold tracking-tight sm:text-3xl min-h-[3.75rem] w-full max-w-md sm:min-h-[4.875rem]"
                : "text-2xl font-semibold tracking-tight sm:text-3xl"
            }
          >
            <Skeleton className="h-8 w-3/4 sm:h-9" />
          </div>

          {layout.showSalePrice ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-5 w-24" />
            </div>
          ) : (
            <Skeleton className="h-7 w-28" />
          )}

          <Skeleton className="h-5 w-32" />

          <div className="space-y-2 text-base leading-relaxed">
            {Array.from({ length: layout.descriptionLines }, (_, index) => (
              <Skeleton
                key={index}
                className={
                  index === layout.descriptionLines - 1
                    ? "h-[1.625rem] w-5/6"
                    : "h-[1.625rem] w-full"
                }
              />
            ))}
          </div>

          <div className="flex flex-col gap-4 border-t border-muted/20 pt-6 sm:flex-row sm:items-end">
            <div className="space-y-2 sm:flex-1">
              <Skeleton className="h-4 w-16" />
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-5 w-6" />
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <Skeleton className="h-12 w-full sm:min-w-[200px] sm:w-auto sm:flex-none sm:self-end" />
          </div>
        </div>
      </div>
    </Container>
  );
}
