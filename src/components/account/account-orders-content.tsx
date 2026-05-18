"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/use-auth";
import { useOrdersByUserId } from "@/hooks/use-orders";
import { formatCurrency } from "@/lib/utils/format";
import { env } from "@/lib/env";

const STATUS_LABELS = {
  pending: "Pending",
  transferred: "Transferred",
  delivered: "Delivered",
  cancelled: "Cancelled",
} as const;

export function AccountOrdersContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid ?? "";

  const { data: orders, isLoading, isError } = useOrdersByUserId(userId);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/account");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <Container className="flex justify-center py-16">
        <Spinner size="lg" />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-12">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Text variant="h1" as="h1">
            Order history
          </Text>
          <Text variant="muted" as="p">
            Orders placed while signed in as {user.email}
          </Text>
        </div>
        <Link href="/account" className="text-sm font-medium text-accent hover:underline">
          ← Back to account
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : null}

      {isError ? (
        <EmptyState
          title="Could not load orders"
          description="Please try again in a moment."
          action={
            <Button href="/account" variant="secondary">
              Back to account
            </Button>
          }
        />
      ) : null}

      {!isLoading && !isError && orders && orders.length > 0 ? (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Text variant="body" as="p" className="font-mono font-medium">
                    {order.orderNumber}
                  </Text>
                  <Text variant="small" as="p">
                    {order.createdAt.toLocaleDateString()} · {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"} ·{" "}
                    {STATUS_LABELS[order.status]}
                  </Text>
                  <Text variant="small" as="p" className="text-muted">
                    {formatCurrency(order.total, env.currency.code, env.currency.locale)}
                  </Text>
                </div>
                <Button
                  href={`/track-order?orderId=${encodeURIComponent(order.id)}`}
                  variant="secondary"
                  size="sm"
                >
                  Track order
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}

      {!isLoading && !isError && orders?.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Place an order while signed in to see it here."
          action={
            <Button href="/shop" size="lg">
              Browse shop
            </Button>
          }
        />
      ) : null}
    </Container>
  );
}
