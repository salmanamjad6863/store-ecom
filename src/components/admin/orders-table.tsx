"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { env } from "@/lib/env";
import { formatCurrency } from "@/lib/utils/format";
import type { Order, OrderStatus } from "@/types/order";

import { OrderDeliveryLabelButton } from "./order-delivery-label-button";

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
  hasFilters?: boolean;
};

export function OrdersTable({ orders, isLoading, isError, hasFilters = false }: OrdersTableProps) {
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
        title={hasFilters ? "No matching orders" : "No orders yet"}
        description={
          hasFilters
            ? "Try a different period, status, or search term."
            : "Orders will appear here when customers complete checkout."
        }
      />
    );
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-muted/20 bg-background">
          <tr>
            <th className="w-16 px-4 py-3 font-medium text-muted">
              <span className="sr-only">Items</span>
            </th>
            <th className="px-4 py-3 font-medium text-muted">Order #</th>
            <th className="px-4 py-3 font-medium text-muted">Customer</th>
            <th className="px-4 py-3 font-medium text-muted">Phone</th>
            <th className="px-4 py-3 font-medium text-muted">Total</th>
            <th className="px-4 py-3 font-medium text-muted">Status</th>
            <th className="px-4 py-3 font-medium text-muted">Date</th>
            <th className="px-4 py-3 font-medium text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const firstItem = order.items[0];
            const image = firstItem?.image;
            const extraItems = order.items.length - 1;

            return (
            <tr key={order.id} className="border-b border-muted/10 last:border-0">
              <td className="px-4 py-3">
                <div className="relative h-12 w-12 shrink-0">
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border border-muted/20 bg-background">
                    {image ? (
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-muted">
                        —
                      </div>
                    )}
                  </div>
                  {extraItems > 0 ? (
                    <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                      +{extraItems}
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-xs sm:text-sm">{order.orderNumber}</td>
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
                <div className="flex flex-col gap-1.5">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium text-accent hover:underline"
                  >
                    View
                  </Link>
                  <OrderDeliveryLabelButton order={order} variant="link" />
                </div>
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
    </Card>
  );
}
