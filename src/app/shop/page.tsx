import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ShopContent } from "@/components/shop/shop-content";
import { CatalogHydration } from "@/components/providers/catalog-hydration";
import { buildCatalogDehydratedState } from "@/lib/queries/hydrate-catalog";
import { resolveCatalogWithVariants } from "@/lib/queries/catalog-variants-server";
import { fetchPhoneModelsOnServer } from "@/lib/queries/phone-models-server";
import { fetchProductsOnServer } from "@/lib/queries/products-server";
import { getModelCollectionPath } from "@/lib/seo/collections";
import { buildShopMetadata, SHOP_SEO } from "@/lib/seo/shop-seo";

type ShopPageProps = {
  searchParams: Promise<{
    model?: string;
    theme?: string;
  }>;
};

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = Boolean(params.model || params.theme);

  return buildShopMetadata({ hasFilters });
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  if (params.model && !params.theme) {
    redirect(getModelCollectionPath(params.model));
  }

  const listFilters = {
    modelId: params.model,
    theme: params.theme,
  };

  const hasListFilters = Boolean(listFilters.modelId || listFilters.theme);

  const [products, catalogProducts, phoneModels] = await Promise.all([
    fetchProductsOnServer(listFilters),
    hasListFilters ? fetchProductsOnServer() : Promise.resolve(null),
    fetchPhoneModelsOnServer(),
  ]);

  const catalog = catalogProducts ?? products;
  const catalogWithVariants = await resolveCatalogWithVariants(catalog);

  const dehydratedState = buildCatalogDehydratedState({
    products,
    catalogProducts: catalog,
    catalogWithVariants,
    listFilters,
    phoneModels,
  });

  return (
    <CatalogHydration state={dehydratedState}>
      <ShopContent skeletonCount={products.length} srTitle={SHOP_SEO.srTitle} />
    </CatalogHydration>
  );
}
