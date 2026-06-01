import { cn } from "@/lib/utils/cn";
import { getPrimaryProductCardBadge } from "@/lib/utils/product";
import type { Product } from "@/types/product";

type ProductCardBadgeProps = {
  product: Product;
  className?: string;
};

/** Single rose tag overlapping the top-right of the product image. */
export function ProductCardBadge({ product, className }: ProductCardBadgeProps) {
  const badge = getPrimaryProductCardBadge(product);

  if (!badge) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-block bg-accent px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-white shadow-sm sm:px-3 ",
        className,
      )}
    >
      {badge.label}
    </span>
  );
}
