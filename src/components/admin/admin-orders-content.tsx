"use client";

import { useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useAdminOrders } from "@/hooks/use-admin-orders";
import { env } from "@/lib/env";
import {
  filterOrdersByMonth,
  getMonthlyOrderStats,
  type OrderMonthFilter,
} from "@/lib/utils/order-stats";
import { formatCurrency } from "@/lib/utils/format";

import { OrdersTable } from "./orders-table";

const FILTER_OPTIONS: { value: OrderMonthFilter; label: string }[] = [
  { value: "this_month", label: "This month" },
  { value: "all", label: "All time" },
];

export function AdminOrdersContent() {
  const { data: orders, isLoading, isError } = useAdminOrders();
  const [monthFilter, setMonthFilter] = useState<OrderMonthFilter>("this_month");

  const monthlyStats = useMemo(
    () => getMonthlyOrderStats(orders ?? []),
    [orders],
  );

  const filteredOrders = useMemo(
    () => filterOrdersByMonth(orders ?? [], monthFilter),
    [orders, monthFilter],
  );

  return (
    <div className="space-y-6">
      <div>
        <Text variant="h1" as="h1">
          Orders
        </Text>
        <Text variant="muted" as="p" className="mt-2">
          View and update customer orders. Set status to Transferred to accept an order — the
          customer receives an email with order details.
        </Text>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="space-y-1">
          <Text variant="small" as="p" className="text-muted">
            Revenue — {monthlyStats.monthLabel}
          </Text>
          <Text variant="h2" as="p" className="text-2xl font-semibold">
            {formatCurrency(monthlyStats.revenue, env.currency.code, env.currency.locale)}
          </Text>
          <Text variant="small" as="p" className="text-muted">
            Excludes cancelled orders
          </Text>
        </Card>
        <Card className="space-y-1">
          <Text variant="small" as="p" className="text-muted">
            Orders — {monthlyStats.monthLabel}
          </Text>
          <Text variant="h2" as="p" className="text-2xl font-semibold">
            {monthlyStats.orderCount}
          </Text>
          <Text variant="small" as="p" className="text-muted">
            All statuses included
          </Text>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Text variant="small" as="span" className="font-medium text-muted">
          Show orders:
        </Text>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMonthFilter(option.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                monthFilter === option.value
                  ? "border-accent bg-accent text-white"
                  : "border-muted/30 bg-surface text-foreground hover:border-accent/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Text variant="small" as="span" className="text-muted">
          {filteredOrders.length} order{filteredOrders.length === 1 ? "" : "s"}
        </Text>
      </div>

      <OrdersTable orders={filteredOrders} isLoading={isLoading} isError={isError} />
    </div>
  );
}
