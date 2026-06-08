import { cn } from "@/lib/utils/cn";
import { getPrimaryProductCardBadge } from "@/lib/utils/product";
import type { Product } from "@/types/product";

type ProductCardBadgeProps = {
  product: Product;
  className?: string;
};

const badgeStyles = {
  new: "border-accent/25 bg-accent/[0.07] text-accent",
  hot: "border-deep/15 bg-blush/40 text-deep",
  sale: "border-accent/30 bg-accent/10 text-accent",
  soldOut: "border-muted/25 bg-muted/10 text-muted",
  lowStock: "border-gold/35 bg-gold/10 text-deep",
} as const;

export function ProductCardBadge({ product, className }: ProductCardBadgeProps) {
  const badge = getPrimaryProductCardBadge(product);

  if (!badge) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] sm:text-[10px]",
        badgeStyles[badge.variant] ?? badgeStyles.new,
        className,
      )}
    >
      {badge.label}
    </span>
  );
}
