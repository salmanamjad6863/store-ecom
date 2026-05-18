"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { queryKeys } from "@/lib/queries/keys";
import {
  fetchAllOrders,
  fetchOrderById,
  updateOrderStatus,
} from "@/lib/queries/orders";
import type { OrderStatus } from "@/types/order";

export function useAdminOrders() {
  return useQuery({
    queryKey: queryKeys.orders.adminList,
    queryFn: fetchAllOrders,
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.adminDetail(id),
    queryFn: () => fetchOrderById(id),
    enabled: Boolean(id),
  });
}

export function useOrderStatusMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      if (user) {
        const token = await user.getIdToken();

        const response = await fetch(`/api/admin/orders/${id}/status`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        });

        if (response.ok) {
          const data = (await response.json()) as { order: Awaited<ReturnType<typeof fetchOrderById>> };
          return data.order;
        }

        if (response.status !== 401 && response.status !== 403) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "Could not update order status.");
        }
      }

      await updateOrderStatus(id, status);
      return fetchOrderById(id);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
      ]);
    },
  });
}
