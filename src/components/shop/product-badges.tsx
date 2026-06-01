import { Badge } from "@/components/ui/badge";
import { getProductCardBadges } from "@/lib/utils/product";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils/cn";

type ProductBadgesProps = {
  product: Product;
  className?: string;
};

export function ProductBadges({ product, className }: ProductBadgesProps) {
  const badges = getProductCardBadges(product);

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      {badges.map((badge) => (
        <Badge key={badge.label} variant={badge.variant}>
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}
