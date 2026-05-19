import { Skeleton } from "@/components/ui/skeleton";
import { getProductCardSkeletonFlags } from "@/lib/skeleton/product-layout";
import type { Product } from "@/types/product";

import { ProductCardShell } from "./product-card-shell";

type ProductCardSkeletonProps = {
  product?: Product;
};

export function ProductCardSkeleton({ product }: ProductCardSkeletonProps) {
  const { showBadge, showSalePrice } = getProductCardSkeletonFlags(product);

  return (
    <ProductCardShell
      className="pointer-events-none"
      image={<Skeleton className="absolute inset-0 rounded-md sm:rounded-lg" />}
      badge={
        showBadge ? (
          <Skeleton className="h-[18px] w-14 rounded-full sm:h-5 sm:w-16" />
        ) : undefined
      }
      type={<Skeleton className="inline-block h-[14px] w-16 max-w-[40%] sm:h-4 sm:w-20" />}
      title={
        <Skeleton className="block h-full min-h-[2.40625rem] w-full rounded sm:min-h-[3.09375rem]" />
      }
      price={
        showSalePrice ? (
          <span className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-2">
            <Skeleton className="h-4 w-20 sm:h-5 sm:w-24" />
            <Skeleton className="h-3.5 w-16 sm:h-4 sm:w-20" />
          </span>
        ) : (
          <Skeleton className="inline-block h-4 w-24 sm:h-5 sm:w-28" />
        )
      }
    />
  );
}
