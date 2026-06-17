import { cn } from "@/lib/utils/cn";
import {
  PRODUCT_CARD_META_CLASSES,
  PRODUCT_CARD_PRICE_CLASSES,
  PRODUCT_CARD_TITLE_CLASSES,
} from "@/lib/skeleton/product-layout";

type ProductCardShellProps = {
  image: React.ReactNode;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
  title: React.ReactNode;
  price: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  role?: string;
  tabIndex?: number;
  "aria-label"?: string;
};

/** Shared card frame — ProductCard and ProductCardSkeleton use the same layout. */
export function ProductCardShell({
  image,
  badge,
  meta,
  title,
  price,
  extra,
  className,
  onClick,
  onKeyDown,
  role,
  tabIndex,
  "aria-label": ariaLabel,
}: ProductCardShellProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-deep/[0.06] bg-white",
        "shadow-[0_8px_30px_rgba(43,26,20,0.04)] transition-all duration-300",
        "hover:border-deep/10 hover:shadow-[0_20px_50px_rgba(43,26,20,0.1)]",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
    >
      <div className="relative p-2 sm:p-2.5">
        <div className="relative aspect-[9/16] rounded-xl bg-soft p-2.5 sm:rounded-2xl sm:p-3">
          <div className="relative h-full w-full min-h-0">{image}</div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-3 pb-4 pt-1 text-center sm:px-4 sm:pb-5">
        {badge ? <div className="mb-2 flex justify-center">{badge}</div> : null}
        <div className={cn(PRODUCT_CARD_TITLE_CLASSES, "w-full")}>{title}</div>
        {meta ? (
          <div className={cn(PRODUCT_CARD_META_CLASSES, "mt-1 w-full")}>{meta}</div>
        ) : null}
        <div className={cn(PRODUCT_CARD_PRICE_CLASSES, "mt-2 flex justify-center")}>{price}</div>
        {extra ? <div className="mt-3 w-full">{extra}</div> : null}
      </div>
    </article>
  );
}
