"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries/keys";
import {
  createProduct,
  fetchAdminProducts,
  fetchProductById,
  updateProduct,
  type ProductInput,
} from "@/lib/queries/products";

export function useAdminProducts() {
  return useQuery({
    queryKey: queryKeys.products.adminList,
    queryFn: fetchAdminProducts,
  });
}

export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.adminDetail(id),
    queryFn: () => fetchProductById(id),
    enabled: Boolean(id),
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  const invalidateProducts = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  };

  const createMutation = useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: invalidateProducts,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) =>
      updateProduct(id, input),
    onSuccess: invalidateProducts,
  });

  return { createMutation, updateMutation };
}
