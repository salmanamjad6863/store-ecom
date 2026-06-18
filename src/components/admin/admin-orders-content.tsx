"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAdminOrders } from "@/hooks/use-admin-orders";
import { env } from "@/lib/env";
import { formatCurrency } from "@/lib/utils/format";
import { ADMIN_STATUS_LABELS } from "@/lib/utils/order-status";
import {
  filterOrdersByPeriod,
  filterOrdersBySearch,
  filterOrdersByStatus,
  getOrderMonthOptions,
  getOrderPeriodStats,
  type OrderPeriodPreset,
  type OrderStatusFilter,
} from "@/lib/utils/order-stats";
import { ORDER_STATUSES } from "@/types/order";

import { OrdersTable } from "./orders-table";

const PAGE_SIZE = 25;

const PERIOD_OPTIONS: Array<{ value: OrderPeriodPreset; label: string }> = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "pick_month", label: "Pick month" },
  { value: "all", label: "All time" },
];

const selectClassName =
  "h-11 w-full rounded-lg border border-muted/30 bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:max-w-xs";

export function AdminOrdersContent() {
  const { data: orders, isLoading, isError } = useAdminOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all");
  const [periodPreset, setPeriodPreset] = useState<OrderPeriodPreset>("this_month");
  const [pickedMonth, setPickedMonth] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const monthOptions = useMemo(() => getOrderMonthOptions(orders ?? []), [orders]);

  useEffect(() => {
    if (periodPreset !== "pick_month") {
      return;
    }

    if (pickedMonth && monthOptions.some((option) => option.value === pickedMonth)) {
      return;
    }

    setPickedMonth(monthOptions[0]?.value ?? "");
  }, [monthOptions, periodPreset, pickedMonth]);

  const periodStats = useMemo(
    () =>
      getOrderPeriodStats(
        orders ?? [],
        periodPreset,
        periodPreset === "pick_month" ? pickedMonth : null,
      ),
    [orders, periodPreset, pickedMonth],
  );

  const filteredOrders = useMemo(() => {
    const list = orders ?? [];
    const byPeriod = filterOrdersByPeriod(
      list,
      periodPreset,
      periodPreset === "pick_month" ? pickedMonth : null,
    );

    return filterOrdersBySearch(filterOrdersByStatus(byPeriod, statusFilter), searchQuery);
  }, [orders, periodPreset, pickedMonth, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [statusFilter, periodPreset, pickedMonth, searchQuery]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, page]);

  const showingFrom = filteredOrders.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, filteredOrders.length);

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

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="space-y-1">
          <Text variant="small" as="p" className="text-muted">
            Delivered revenue — {periodStats.periodLabel}
          </Text>
          <Text variant="h2" as="p" className="text-2xl font-semibold">
            {formatCurrency(periodStats.deliveredRevenue, env.currency.code, env.currency.locale)}
          </Text>
          <Text variant="small" as="p" className="text-muted">
            Real revenue (COD collected on delivery)
          </Text>
        </Card>

        <Card className="space-y-1">
          <Text variant="small" as="p" className="text-muted">
            Delivered orders — {periodStats.periodLabel}
          </Text>
          <Text variant="h2" as="p" className="text-2xl font-semibold">
            {periodStats.deliveredCount}
          </Text>
          <Text variant="small" as="p" className="text-muted">
            Completed deliveries in this period
          </Text>
        </Card>

        <Card className="space-y-2">
          <Text variant="small" as="p" className="text-muted">
            Needs action — {periodStats.periodLabel}
          </Text>
          <div className="flex items-end gap-4">
            <div>
              <Text variant="h2" as="p" className="text-2xl font-semibold">
                {periodStats.pendingCount}
              </Text>
              <Text variant="small" as="p" className="text-muted">
                Pending
              </Text>
            </div>
            <div>
              <Text variant="h2" as="p" className="text-2xl font-semibold">
                {periodStats.transferredCount}
              </Text>
              <Text variant="small" as="p" className="text-muted">
                Transferred
              </Text>
            </div>
          </div>
          <Text variant="small" as="p" className="text-muted">
            {periodStats.needsActionCount} total awaiting delivery
          </Text>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex w-full flex-col gap-2 sm:max-w-xs">
            <label htmlFor="orders-period-filter" className="text-sm font-medium text-muted">
              Period
            </label>
            <select
              id="orders-period-filter"
              value={periodPreset}
              onChange={(event) => setPeriodPreset(event.target.value as OrderPeriodPreset)}
              className={selectClassName}
              aria-label="Filter orders by period"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {periodPreset === "pick_month" ? (
            <div className="flex w-full flex-col gap-2 sm:max-w-xs">
              <label htmlFor="orders-picked-month" className="text-sm font-medium text-muted">
                Month
              </label>
              <select
                id="orders-picked-month"
                value={pickedMonth}
                onChange={(event) => setPickedMonth(event.target.value)}
                className={selectClassName}
                aria-label="Pick order month"
                disabled={monthOptions.length === 0}
              >
                {monthOptions.length === 0 ? (
                  <option value="">No orders yet</option>
                ) : (
                  monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))
                )}
              </select>
            </div>
          ) : null}

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

          <div className="flex w-full flex-col gap-2 sm:max-w-sm">
            <label htmlFor="orders-search" className="text-sm font-medium text-muted">
              Search
            </label>
            <Input
              id="orders-search"
              placeholder="Order #, name, or phone"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Text variant="small" as="p" className="text-muted">
            {filteredOrders.length === 0
              ? "No orders match your filters"
              : `Showing ${showingFrom}–${showingTo} of ${filteredOrders.length} order${filteredOrders.length === 1 ? "" : "s"}`}
          </Text>

          {filteredOrders.length > PAGE_SIZE ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Text variant="small" as="span" className="text-muted">
                Page {page} of {totalPages}
              </Text>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <OrdersTable
        orders={paginatedOrders}
        isLoading={isLoading}
        isError={isError}
        hasFilters={
          statusFilter !== "all" ||
          periodPreset !== "all" ||
          searchQuery.trim().length > 0
        }
      />
    </div>
  );
}
