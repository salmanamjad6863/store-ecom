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
        "grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4",
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
