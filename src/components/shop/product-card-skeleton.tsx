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
      image={<Skeleton className="h-full w-full rounded-lg" />}
      badge={
        showBadge ? (
          <Skeleton className="h-5 w-[4.5rem] rounded-full" />
        ) : undefined
      }
      meta={<Skeleton className="mx-auto inline-block h-3 w-28" />}
      title={<Skeleton className="mx-auto block h-10 w-[85%] max-w-[180px] rounded-sm" />}
      price={
        showSalePrice ? (
          <span className="flex items-baseline justify-center gap-2">
            <Skeleton className="h-3.5 w-14" />
            <Skeleton className="h-4 w-16" />
          </span>
        ) : (
          <Skeleton className="mx-auto inline-block h-4 w-20" />
        )
      }
    />
  );
}
