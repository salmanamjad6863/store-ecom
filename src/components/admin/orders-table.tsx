"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { env } from "@/lib/env";
import { formatCurrency } from "@/lib/utils/format";
import type { Order, OrderStatus } from "@/types/order";

const STATUS_VARIANT: Record<OrderStatus, "default" | "sale" | "soldOut"> = {
  pending: "default",
  transferred: "sale",
  delivered: "sale",
  cancelled: "soldOut",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  transferred: "Transferred",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

type OrdersTableProps = {
  orders: Order[];
  isLoading: boolean;
  isError: boolean;
};

export function OrdersTable({ orders, isLoading, isError }: OrdersTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Could not load orders"
        description="Check your Firebase connection and try again."
      />
    );
  }

  if (!orders.length) {
    return (
      <EmptyState
        title="No orders yet"
        description="Orders will appear here when customers complete checkout."
      />
    );
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead className="border-b border-muted/20 bg-background">
          <tr>
            <th className="px-4 py-3 font-medium text-muted">Order #</th>
            <th className="px-4 py-3 font-medium text-muted">Order ID</th>
            <th className="px-4 py-3 font-medium text-muted">Customer</th>
            <th className="px-4 py-3 font-medium text-muted">Phone</th>
            <th className="px-4 py-3 font-medium text-muted">Total</th>
            <th className="px-4 py-3 font-medium text-muted">Status</th>
            <th className="px-4 py-3 font-medium text-muted">Date</th>
            <th className="px-4 py-3 font-medium text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-muted/10 last:border-0">
              <td className="px-4 py-3 font-mono text-xs sm:text-sm">{order.orderNumber}</td>
              <td className="max-w-[120px] truncate px-4 py-3 font-mono text-xs text-muted" title={order.id}>
                {order.id}
              </td>
              <td className="px-4 py-3 font-medium text-foreground">{order.customer.name}</td>
              <td className="px-4 py-3 text-muted">{order.customer.phone}</td>
              <td className="px-4 py-3 text-muted">
                {formatCurrency(order.total, env.currency.code, env.currency.locale)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[order.status]}>
                  {STATUS_LABELS[order.status]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted">
                {order.createdAt.toLocaleDateString()}{" "}
                {order.createdAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium text-accent hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
