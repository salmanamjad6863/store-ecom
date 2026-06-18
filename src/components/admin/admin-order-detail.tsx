"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { OrderItemRow } from "@/components/orders/order-item-row";
import { OrderPricingSummary } from "@/components/orders/order-pricing-summary";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useAdminOrder, useOrderStatusMutation } from "@/hooks/use-admin-orders";
import { fetchProductsByIds } from "@/lib/queries/products";
import type { OrderStatus } from "@/types/order";

import { OrderDeliveryLabelButton } from "./order-delivery-label-button";
import { OrderStatusSelect } from "./order-status-select";

type AdminOrderDetailProps = {
  orderId: string;
};

export function AdminOrderDetail({ orderId }: AdminOrderDetailProps) {
  const { data: order, isLoading, isError } = useAdminOrder(orderId);
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const statusMutation = useOrderStatusMutation();

  useEffect(() => {
    if (order) {
      setStatus(order.status);
    }
  }, [order]);

  const productIds = useMemo(
    () => [...new Set(order?.items.map((item) => item.productId) ?? [])],
    [order?.items],
  );

  const { data: catalogProducts = [] } = useQuery({
    queryKey: ["products", "order-detail", productIds],
    queryFn: () => fetchProductsByIds(productIds),
    enabled: Boolean(order) && productIds.length > 0,
  });

  const productsById = useMemo(
    () => new Map(catalogProducts.map((product) => [product.id, product])),
    [catalogProducts],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <EmptyState
        title="Order not found"
        description="This order may have been removed."
        action={<Button href="/admin/orders">Back to orders</Button>}
      />
    );
  }

  const hasStatusChange = status !== order.status;

  const handleSaveStatus = async () => {
    setSaveError(null);
    setEmailNotice(null);

    try {
      const previousStatus = order.status;
      await statusMutation.mutateAsync({ id: order.id, status });

      if (previousStatus !== "transferred" && status === "transferred") {
        setEmailNotice(`Acceptance email sent to ${order.customer.email}.`);
      }
    } catch {
      setSaveError("Could not update order status. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className="text-sm font-medium text-accent hover:underline">
          ← Back to orders
        </Link>
        <Text variant="h1" as="h1" className="mt-2 font-mono text-xl sm:text-2xl">
          {order.orderNumber}
        </Text>
        <Text variant="muted" as="p" className="mt-1">
          Order ID: <span className="font-mono text-foreground">{order.id}</span>
        </Text>
        <Text variant="muted" as="p" className="mt-1">
          Placed {order.createdAt.toLocaleString()} · Cash on delivery
        </Text>
        <div className="mt-4">
          <OrderDeliveryLabelButton order={order} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <Text variant="h2" as="h2" className="text-lg">
            Customer
          </Text>
          <Text variant="body" as="p">
            {order.customer.name}
            <br />
            {order.customer.phone}
            <br />
            {order.customer.email}
            <br />
            <br />
            {order.customer.addressLine1}
            <br />
            {order.customer.city}
            {order.customer.postalCode ? `, ${order.customer.postalCode}` : ""}
          </Text>
          {order.customer.notes ? (
            <Text variant="small" as="p" className="text-muted">
              Notes: {order.customer.notes}
            </Text>
          ) : null}
        </Card>

        <Card className="space-y-4">
          <Text variant="h2" as="h2" className="text-lg">
            Update status
          </Text>
          <OrderStatusTimeline status={order.status} />
          <OrderStatusSelect
            value={status}
            onChange={setStatus}
            disabled={statusMutation.isPending}
            error={saveError}
          />
          <Text variant="small" as="p" className="text-muted">
            Set status to Transferred to accept the order and email the customer.
          </Text>
          <Button
            type="button"
            disabled={!hasStatusChange || statusMutation.isPending}
            onClick={() => {
              void handleSaveStatus();
            }}
          >
            {statusMutation.isPending ? "Saving…" : "Save status"}
          </Button>
          {statusMutation.isSuccess && !hasStatusChange ? (
            <Text variant="small" as="p" className="text-accent">
              Status updated successfully.
            </Text>
          ) : null}
          {emailNotice ? (
            <Text variant="small" as="p" className="text-accent">
              {emailNotice}
            </Text>
          ) : null}
        </Card>
      </div>

      <Card className="space-y-4">
        <Text variant="h2" as="h2" className="text-lg">
          Items
        </Text>
        <ul className="divide-y divide-muted/20">
          {order.items.map((item) => (
            <OrderItemRow
              key={`${item.productId}-${item.variantId ?? item.slug}`}
              item={item}
              product={productsById.get(item.productId)}
            />
          ))}
        </ul>
        <OrderPricingSummary
          subtotal={order.subtotal}
          shipping={order.shipping}
          total={order.total}
          totalLabel="Total"
          className="border-t border-muted/20 pt-4"
        />
      </Card>
    </div>
  );
}
