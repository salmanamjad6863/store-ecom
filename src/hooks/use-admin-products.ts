"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { revalidateStorefrontCatalog } from "@/lib/admin/revalidate-catalog-client";
import { useAuth } from "@/hooks/use-auth";
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
  const { user } = useAuth();

  const invalidateAdminProducts = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.products.adminList });
  };

  const revalidateStorefront = async (slug?: string) => {
    if (!user) {
      return;
    }

    try {
      const token = await user.getIdToken();
      await revalidateStorefrontCatalog(token, slug);
    } catch (error) {
      console.error("[catalog] Storefront revalidation failed:", error);
    }
  };

  const createMutation = useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: async (_id, input) => {
      await invalidateAdminProducts();
      await revalidateStorefront(input.slug);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) =>
      updateProduct(id, input),
    onSuccess: async (_result, { input }) => {
      await invalidateAdminProducts();
      await revalidateStorefront(input.slug);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: async () => {
      await invalidateAdminProducts();
      await revalidateStorefront();
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
