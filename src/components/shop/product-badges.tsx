import { Badge } from "@/components/ui/badge";
import {
  formatSalePercentLabel,
  getProductSalePercent,
  isProductSoldOut,
} from "@/lib/utils/product";
import type { Product } from "@/types/product";

type ProductBadgesProps = {
  product: Product;
  className?: string;
};

export function ProductBadges({ product, className }: ProductBadgesProps) {
  const soldOut = isProductSoldOut(product);
  const salePercent = getProductSalePercent(product);

  return (
    <div className={className}>
      {soldOut ? (
        <Badge variant="soldOut" className="px-1.5 py-0 text-[10px] sm:px-2.5 sm:text-xs">
          Sold out
        </Badge>
      ) : null}
      {!soldOut && product.onSale ? (
        <Badge variant="sale" className="px-1.5 py-0 text-[10px] sm:px-2.5 sm:text-xs">
          {salePercent !== null ? formatSalePercentLabel(salePercent) : "Sale"}
        </Badge>
      ) : null}
    </div>
  );
}
