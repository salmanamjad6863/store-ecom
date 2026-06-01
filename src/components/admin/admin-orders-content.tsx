"use client";

import { useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useAdminOrders } from "@/hooks/use-admin-orders";
import { env } from "@/lib/env";
import { ADMIN_STATUS_LABELS } from "@/lib/utils/order-status";
import {
  filterOrdersByMonth,
  filterOrdersByStatus,
  getMonthlyOrderStats,
  type OrderMonthFilter,
  type OrderStatusFilter,
} from "@/lib/utils/order-stats";
import { formatCurrency } from "@/lib/utils/format";
import { ORDER_STATUSES } from "@/types/order";

import { OrdersTable } from "./orders-table";

const MONTH_FILTER_OPTIONS: { value: OrderMonthFilter; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "this_month", label: "This month" },
];

const selectClassName =
  "h-11 w-full rounded-lg border border-muted/30 bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:max-w-xs";

export function AdminOrdersContent() {
  const { data: orders, isLoading, isError } = useAdminOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all");
  const [monthFilter, setMonthFilter] = useState<OrderMonthFilter>("all");

  const monthlyStats = useMemo(
    () => getMonthlyOrderStats(orders ?? []),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const list = orders ?? [];
    return filterOrdersByMonth(
      filterOrdersByStatus(list, statusFilter),
      monthFilter,
    );
  }, [orders, statusFilter, monthFilter]);

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

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex w-full flex-col gap-2 sm:max-w-xs">
          <label htmlFor="orders-status-filter" className="text-sm font-medium text-muted">
            Status
          </label>
          <select
            id="orders-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as OrderStatusFilter)}
            className={selectClassName}
            aria-label="Filter orders by status"
          >
            <option value="all">All orders</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ADMIN_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex w-full flex-col gap-2 sm:max-w-xs">
          <label htmlFor="orders-month-filter" className="text-sm font-medium text-muted">
            Month
          </label>
          <select
            id="orders-month-filter"
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value as OrderMonthFilter)}
            className={selectClassName}
            aria-label="Filter orders by month"
          >
            {MONTH_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Text variant="small" as="p" className="pb-2.5 text-muted sm:ml-auto">
          {filteredOrders.length} order{filteredOrders.length === 1 ? "" : "s"}
        </Text>
      </div>

      <OrdersTable orders={filteredOrders} isLoading={isLoading} isError={isError} />
    </div>
  );
}
