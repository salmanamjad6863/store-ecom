"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries/keys";
import { productQueryDefaults } from "@/lib/queries/product-query-options";
import { fetchPhoneModels, fetchAllPhoneModelsAdmin } from "@/lib/queries/phone-models";

export function usePhoneModels(activeOnly = true) {
  return useQuery({
    queryKey: queryKeys.phoneModels.list(activeOnly),
    queryFn: () => fetchPhoneModels({ activeOnly }),
    ...productQueryDefaults,
  });
}

export function useAdminPhoneModels() {
  return useQuery({
    queryKey: queryKeys.phoneModels.adminList,
    queryFn: fetchAllPhoneModelsAdmin,
  });
}
