import { cn } from "@/lib/utils/cn";
import { getPrimaryProductCardBadge } from "@/lib/utils/product";
import type { Product } from "@/types/product";

type ProductCardBadgeProps = {
  product: Product;
  className?: string;
};

const badgeStyles = {
  new: "bg-accent text-white",
  hot: "bg-deep text-white",
  sale: "bg-accent text-white",
  soldOut: "bg-danger/90 text-white",
  lowStock: "bg-gold text-deep",
} as const;

/** Single rose tag overlapping the top-right of the product image. */
export function ProductCardBadge({ product, className }: ProductCardBadgeProps) {
  const badge = getPrimaryProductCardBadge(product);

  if (!badge) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-block px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] shadow-sm sm:px-3",
        badgeStyles[badge.variant] ?? badgeStyles.new,
        className,
      )}
    >
      {badge.label}
    </span>
  );
}
