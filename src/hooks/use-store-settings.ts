"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries/keys";
import { productQueryDefaults } from "@/lib/queries/product-query-options";
import { reviveProducts } from "@/lib/queries/product-serialization";
import {
  fetchFeaturedHeroProducts,
  fetchHomepageSettings,
  saveHomepageFeaturedProducts,
} from "@/lib/queries/store-settings";

export function useFeaturedHeroProducts() {
  return useQuery({
    queryKey: queryKeys.storeSettings.featuredHero,
    queryFn: fetchFeaturedHeroProducts,
    select: reviveProducts,
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

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.storeSettings.all });
  };

  const saveFeaturedMutation = useMutation({
    mutationFn: (productIds: string[]) => saveHomepageFeaturedProducts(productIds),
    onSuccess: invalidate,
  });

  return { saveFeaturedMutation };
}
