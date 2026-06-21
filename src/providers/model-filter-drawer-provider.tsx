"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  seedFilteredCatalogCache,
  type ShopFilter,
} from "@/lib/shop/shop-filter";

export type OptimisticShopFilter = {
  modelId?: string;
  theme?: string | null;
};

type ModelFilterDrawerContextValue = {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  optimisticFilter: OptimisticShopFilter | null;
  applyShopFilter: (filter: OptimisticShopFilter) => void;
  clearOptimisticFilter: () => void;
};

const ModelFilterDrawerContext = createContext<ModelFilterDrawerContextValue | null>(null);

export function ModelFilterDrawerProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [optimisticFilter, setOptimisticFilter] = useState<OptimisticShopFilter | null>(null);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);
  const toggleDrawer = useCallback(() => setIsOpen((current) => !current), []);

  const clearOptimisticFilter = useCallback(() => {
    setOptimisticFilter(null);
  }, []);

  const applyShopFilter = useCallback(
    (filter: OptimisticShopFilter) => {
      const normalized: ShopFilter = {
        modelId: filter.modelId,
        theme: filter.theme ?? undefined,
      };

      seedFilteredCatalogCache(queryClient, normalized);
      setOptimisticFilter(filter);
    },
    [queryClient],
  );

  const value = useMemo(
    () => ({
      isOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      optimisticFilter,
      applyShopFilter,
      clearOptimisticFilter,
    }),
    [
      isOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      optimisticFilter,
      applyShopFilter,
      clearOptimisticFilter,
    ],
  );

  return (
    <ModelFilterDrawerContext.Provider value={value}>{children}</ModelFilterDrawerContext.Provider>
  );
}

export function useModelFilterDrawer() {
  const context = useContext(ModelFilterDrawerContext);

  if (!context) {
    throw new Error("useModelFilterDrawer must be used within ModelFilterDrawerProvider");
  }

  return context;
}
