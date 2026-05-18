import { env } from "@/lib/env";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type PriceProps = {
  amount: number;
  compareAt?: number;
  className?: string;
};

export function Price({ amount, compareAt, className }: PriceProps) {
  const formatted = formatCurrency(amount, env.currency.code, env.currency.locale);

  if (compareAt !== undefined && compareAt > amount) {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        <span className="font-semibold text-foreground">{formatted}</span>
        <span className="text-sm text-muted line-through">
          {formatCurrency(compareAt, env.currency.code, env.currency.locale)}
        </span>
      </span>
    );
  }

  return <span className={cn("font-semibold text-foreground", className)}>{formatted}</span>;
}
