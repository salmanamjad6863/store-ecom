"use client";

import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { ORDER_STATUSES, type OrderStatus } from "@/types/order";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  transferred: "Transferred",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

type OrderStatusSelectProps = {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  disabled?: boolean;
  error?: string | null;
};

export function OrderStatusSelect({
  value,
  onChange,
  disabled = false,
  error,
}: OrderStatusSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="order-status">Order status</Label>
      <select
        id="order-status"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as OrderStatus)}
        className="flex h-11 w-full max-w-xs rounded-lg border border-muted/30 bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
      >
        {ORDER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      {error ? (
        <Text variant="small" as="p" className="text-danger">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
