"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries/keys";
import { fetchOrderByOrderNumber, fetchOrdersByUserId } from "@/lib/queries/orders";

export function useOrderByNumber(orderNumber: string) {
  return useQuery({
    queryKey: queryKeys.orders.byNumber(orderNumber),
    queryFn: () => fetchOrderByOrderNumber(orderNumber),
    enabled: Boolean(orderNumber),
  });
}

export function useOrdersByUserId(userId: string) {
  return useQuery({
    queryKey: queryKeys.orders.byUser(userId),
    queryFn: () => fetchOrdersByUserId(userId),
    enabled: Boolean(userId),
  });
}
