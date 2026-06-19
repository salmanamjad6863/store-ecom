import { QueryClient, dehydrate, type DehydratedState } from "@tanstack/react-query";

import type { FeaturedHeroItem } from "@/lib/featured/hero-items";
import { deriveShopModelIds } from "@/lib/shop/catalog-derived";
import { queryKeys } from "@/lib/queries/keys";
import {
  PRODUCT_GC_TIME_MS,
  PRODUCT_STALE_TIME_MS,
} from "@/lib/queries/product-query-options";
import { reviveProduct, reviveProducts } from "@/lib/queries/product-serialization";
import type { Product } from "@/types/product";
import type { PhoneModel } from "@/types/phone-model";

type CatalogListFilters = {
  type?: string;
  modelId?: string;
  theme?: string;
};

type BuildCatalogDehydratedStateOptions = {
  /** Products for the active list query (may be filtered on shop). */
  products: Product[];
  /** Full catalog for drawer metadata and unfiltered list cache. */
  catalogProducts?: Product[];
  featuredHeroItems?: FeaturedHeroItem[];
  listFilters?: CatalogListFilters;
  phoneModels?: PhoneModel[];
};

function createSeedQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: PRODUCT_STALE_TIME_MS,
        gcTime: PRODUCT_GC_TIME_MS,
      },
    },
  });
}

/** Seed React Query with server-fetched catalog data for instant client render. */
export function buildCatalogDehydratedState({
  products,
  catalogProducts,
  featuredHeroItems,
  listFilters = {},
  phoneModels,
}: BuildCatalogDehydratedStateOptions): DehydratedState {
  const queryClient = createSeedQueryClient();
  const revived = reviveProducts(products);
  const revivedCatalog = reviveProducts(catalogProducts ?? products);

  queryClient.setQueryData(queryKeys.products.list(listFilters), revived);
  queryClient.setQueryData(queryKeys.products.list({}), revivedCatalog);

  if (featuredHeroItems) {
    queryClient.setQueryData(
      queryKeys.storeSettings.featuredHero,
      featuredHeroItems.map((item) => ({
        ...item,
        product: reviveProduct(item.product),
      })),
    );
  }

  if (phoneModels) {
    queryClient.setQueryData(queryKeys.phoneModels.list(true), phoneModels);
    queryClient.setQueryData(
      queryKeys.products.shopModels,
      deriveShopModelIds(revivedCatalog, phoneModels),
    );
  }

  return dehydrate(queryClient);
}
