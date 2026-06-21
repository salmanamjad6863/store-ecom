"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition, type MouseEvent } from "react";

import { buildShopModelHref, isShopCatalogListingPath } from "@/lib/seo/collections";
import { useModelFilterDrawer } from "@/providers/model-filter-drawer-provider";

export function useNavigateShopFilter() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigating, startTransition] = useTransition();
  const { applyShopFilter, optimisticFilter } = useModelFilterDrawer();

  const activeTheme = searchParams.get("theme");
  const preserveTheme =
    pathname === "/shop" || pathname.endsWith("-cases") ? activeTheme : null;

  const navigateToFilter = useCallback(
    (modelId?: string) => {
      const href = buildShopModelHref(modelId, preserveTheme);

      applyShopFilter({ modelId, theme: preserveTheme });
      startTransition(() => {
        if (isShopCatalogListingPath(pathname)) {
          router.push(href, { scroll: false });
          return;
        }

        router.push(href);
      });
    },
    [applyShopFilter, pathname, preserveTheme, router],
  );

  const handleFilterClick = useCallback(
    (modelId?: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      navigateToFilter(modelId);
    },
    [navigateToFilter],
  );

  const prefetchFilter = useCallback(
    (modelId?: string) => {
      router.prefetch(buildShopModelHref(modelId, preserveTheme));
    },
    [preserveTheme, router],
  );

  return {
    isNavigating,
    optimisticFilter,
    preserveTheme,
    navigateToFilter,
    handleFilterClick,
    prefetchFilter,
    buildHref: (modelId?: string) => buildShopModelHref(modelId, preserveTheme),
  };
}
