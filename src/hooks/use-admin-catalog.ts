"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries/keys";
import { productQueryDefaults } from "@/lib/queries/product-query-options";
import { countCasesPerModel, fetchProductThemes } from "@/lib/queries/products";

export function useProductThemes() {
  return useQuery({
    queryKey: queryKeys.products.themes,
    queryFn: fetchProductThemes,
  });
}

export function useCasesPerModel() {
  return useQuery({
    queryKey: queryKeys.products.casesPerModel,
    queryFn: countCasesPerModel,
  });
}
