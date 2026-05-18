"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries/keys";
import { fetchOrderByOrderNumber, fetchOrdersByUserId } from "@/lib/queries/orders";
import type { Order } from "@/types/order";

type UseOrderByNumberOptions = {
  enabled?: boolean;
};

export function useOrderByNumber(
  orderNumber: string,
  initialData?: Order,
  options: UseOrderByNumberOptions = {},
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.orders.byNumber(orderNumber),
    queryFn: () => fetchOrderByOrderNumber(orderNumber),
    enabled: enabled && Boolean(orderNumber),
    initialData,
  });
}

export function useOrdersByUserId(userId: string) {
  return useQuery({
    queryKey: queryKeys.orders.byUser(userId),
    queryFn: () => fetchOrdersByUserId(userId),
    enabled: Boolean(userId),
  });
}
