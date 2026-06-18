import { Price } from "@/components/ui/price";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils/cn";

type OrderPricingSummaryProps = {
  subtotal: number;
  shipping: number;
  total: number;
  className?: string;
  totalLabel?: string;
};

export function OrderPricingSummary({
  subtotal,
  shipping,
  total,
  className,
  totalLabel = "Total (COD)",
}: OrderPricingSummaryProps) {
  const isFreeDelivery = shipping === 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">Subtotal</span>
        <Price amount={subtotal} className="text-sm" />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">Delivery</span>
        {isFreeDelivery ? (
          <span className="text-sm font-medium text-accent">Free</span>
        ) : (
          <Price amount={shipping} className="text-sm" />
        )}
      </div>
      <div className="flex items-center justify-between border-t border-muted/20 pt-2">
        <Text variant="h2" as="span" className="text-lg">
          {totalLabel}
        </Text>
        <Price amount={total} className="text-lg" />
      </div>
    </div>
  );
}
