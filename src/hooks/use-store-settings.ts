"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { revalidateStorefrontCatalog } from "@/lib/admin/revalidate-catalog-client";
import { useAuth } from "@/hooks/use-auth";
import type { FeaturedHeroSlot } from "@/lib/featured/hero-items";
import { queryKeys } from "@/lib/queries/keys";
import { productQueryDefaults } from "@/lib/queries/product-query-options";
import { reviveProduct } from "@/lib/queries/product-serialization";
import {
  fetchFeaturedHeroProducts,
  fetchHomepageSettings,
  saveHomepageFeaturedProducts,
} from "@/lib/queries/store-settings";

export function useFeaturedHeroProducts() {
  return useQuery({
    queryKey: queryKeys.storeSettings.featuredHero,
    queryFn: fetchFeaturedHeroProducts,
    select: (items) =>
      items.map((item) => ({
        ...item,
        product: reviveProduct(item.product),
      })),
    ...productQueryDefaults,
  });
}

export function useHomepageSettings() {
  return useQuery({
    queryKey: queryKeys.storeSettings.homepage,
    queryFn: fetchHomepageSettings,
  });
}

export function useHomepageSettingsMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.storeSettings.all });
  };

  const revalidateStorefront = async () => {
    if (!user) {
      return;
    }

    try {
      const token = await user.getIdToken();
      await revalidateStorefrontCatalog(token);
    } catch (error) {
      console.error("[catalog] Storefront revalidation failed:", error);
    }
  };

  const saveFeaturedMutation = useMutation({
    mutationFn: (slots: FeaturedHeroSlot[]) => saveHomepageFeaturedProducts(slots),
    onSuccess: async () => {
      await invalidate();
      await revalidateStorefront();
    },
  });

  return { saveFeaturedMutation };
}
