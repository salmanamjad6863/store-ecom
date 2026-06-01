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
  footer?: React.ReactNode;
  className?: string;
};

/** Shared card frame — ProductCard and ProductCardSkeleton use the same layout. */
export function ProductCardShell({
  image,
  badge,
  type,
  title,
  price,
  footer,
  className,
}: ProductCardShellProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden bg-white px-3 pb-3 pt-5 transition-shadow hover:shadow-[0_24px_60px_rgba(43,26,20,0.1)] sm:px-4 sm:pb-4 sm:pt-7",
        className,
      )}
    >
      <div className="relative mb-3">
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-soft z-10">
          {image}
        </div>
        {badge ? (
          <div className="pointer-events-none absolute -right-1 -top-5 z-10 sm:right-1 sm:-top-[21px] z-[0]">
            {badge}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col items-center pb-1 text-center">
        <div className={cn(PRODUCT_CARD_TITLE_CLASSES, "w-full")}>{title}</div>
        <div className={cn(PRODUCT_CARD_TYPE_CLASSES, "mt-0.5 w-full")}>{type}</div>
        <div className={cn(PRODUCT_CARD_PRICE_CLASSES, "mt-1.5 flex justify-center")}>{price}</div>
      </div>

      {footer ? (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-10 overflow-hidden",
            "-mx-3 w-[calc(100%+1.5rem)] sm:-mx-4 sm:w-[calc(100%+2rem)]",
            "translate-y-full transition-transform duration-300 ease-out",
            "group-hover:translate-y-0 group-focus-within:translate-y-0",
          )}
        >
          {footer}
        </div>
      ) : null}
    </article>
  );
}
