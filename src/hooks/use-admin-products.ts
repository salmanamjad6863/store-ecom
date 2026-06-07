"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries/keys";
import {
  createProduct,
  deleteProduct,
  fetchAdminProducts,
  fetchProductWithVariantsById,
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
    queryKey: queryKeys.products.adminDetailWithVariants(id),
    queryFn: () => fetchProductWithVariantsById(id),
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: invalidateProducts,
  });

  return { createMutation, updateMutation, deleteMutation };
}
