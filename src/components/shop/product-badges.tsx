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
      {soldOut ? <Badge variant="soldOut">Sold out</Badge> : null}
      {!soldOut && product.onSale ? <Badge variant="sale">Sale</Badge> : null}
    </div>
  );
}
