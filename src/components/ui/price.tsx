import { env } from "@/lib/env";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type PriceProps = {
  amount: number;
  compareAt?: number;
  className?: string;
  /** When true, strikethrough compare price appears before sale price (Casette style). */
  compareFirst?: boolean;
};

export function Price({ amount, compareAt, className, compareFirst = true }: PriceProps) {
  const formatted = formatCurrency(amount, env.currency.code, env.currency.locale);
  const onSale = compareAt !== undefined && compareAt > amount;

  if (onSale) {
    const compareFormatted = formatCurrency(compareAt, env.currency.code, env.currency.locale);

    return (
      <span className={cn("inline-flex flex-wrap items-baseline gap-1.5 sm:gap-2", className)}>
        {compareFirst ? (
          <>
            <span className="text-xs text-muted/70 line-through sm:text-sm">{compareFormatted}</span>
            <span className="font-medium text-deep">{formatted}</span>
          </>
        ) : (
          <>
            <span className="font-semibold text-foreground">{formatted}</span>
            <span className="text-sm text-muted line-through">{compareFormatted}</span>
          </>
        )}
      </span>
    );
  }

  return <span className={cn("font-medium text-deep", className)}>{formatted}</span>;
}
