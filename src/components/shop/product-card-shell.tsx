import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import {
  PRODUCT_CARD_PRICE_CLASSES,
  PRODUCT_CARD_TITLE_CLASSES,
  PRODUCT_CARD_TYPE_CLASSES,
} from "@/lib/skeleton/product-layout";

type ProductCardShellProps = {
  image: React.ReactNode;
  badge?: React.ReactNode;
  type: React.ReactNode;
  title: React.ReactNode;
  price: React.ReactNode;
  className?: string;
};

/** Shared card frame — ProductCard and ProductCardSkeleton use the same layout. */
export function ProductCardShell({
  image,
  badge,
  type,
  title,
  price,
  className,
}: ProductCardShellProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col gap-2 p-2.5 transition-shadow sm:gap-4 sm:p-4",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-background sm:rounded-lg">
        {image}
        {badge ? <div className="absolute left-1 top-1 sm:left-2 sm:top-2">{badge}</div> : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-2">
        <div className={PRODUCT_CARD_TYPE_CLASSES}>{type}</div>
        <div className={PRODUCT_CARD_TITLE_CLASSES}>{title}</div>
        <div className={PRODUCT_CARD_PRICE_CLASSES}>{price}</div>
      </div>
    </Card>
  );
}
