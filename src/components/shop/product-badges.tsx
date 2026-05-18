import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types/product";
import { isProductSoldOut } from "@/lib/utils/product";

type ProductBadgesProps = {
  product: Product;
  className?: string;
};

export function ProductBadges({ product, className }: ProductBadgesProps) {
  const soldOut = isProductSoldOut(product);

  return (
    <div className={className}>
      {soldOut ? (
        <Badge variant="soldOut" className="px-1.5 py-0 text-[10px] sm:px-2.5 sm:text-xs">
          Sold out
        </Badge>
      ) : null}
      {!soldOut && product.onSale ? (
        <Badge variant="sale" className="px-1.5 py-0 text-[10px] sm:px-2.5 sm:text-xs">
          Sale
        </Badge>
      ) : null}
    </div>
  );
}
