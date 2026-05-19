import { cn } from "@/lib/utils/cn";

import { ProductCardSkeleton } from "./product-card-skeleton";

type ProductGridSkeletonProps = {
  count?: number;
  className?: string;
};

export function ProductGridSkeleton({ count = 8, className }: ProductGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="block h-full">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}
