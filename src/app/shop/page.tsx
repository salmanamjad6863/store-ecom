import type { Metadata } from "next";

import { ShopContent } from "@/components/shop/shop-content";
import { CatalogHydration } from "@/components/providers/catalog-hydration";
import { buildCatalogDehydratedState } from "@/lib/queries/hydrate-catalog";
import { fetchPhoneModelsOnServer } from "@/lib/queries/phone-models-server";
import { fetchProductsOnServer } from "@/lib/queries/products-server";
import { buildDefaultOpenGraph, getSiteUrl } from "@/lib/seo/site";

type ShopPageProps = {
  searchParams: Promise<{
    model?: string;
    theme?: string;
  }>;
};

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = Boolean(params.model || params.theme);
  const title = "Shop iPhone Cases";
  const description =
    "Browse premium iPhone cases at iBloom Elara. Free delivery on orders above Rs. 5,000 and cash on delivery across Pakistan.";

  return {
    title,
    description,
    alternates: {
      canonical: getSiteUrl("/shop"),
    },
    openGraph: buildDefaultOpenGraph(title, description, "/shop"),
    robots: hasFilters ? { index: false, follow: true } : undefined,
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
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

  const dehydratedState = buildCatalogDehydratedState({
    products,
    catalogProducts: catalogProducts ?? products,
    listFilters,
    phoneModels,
  });

  return (
    <CatalogHydration state={dehydratedState}>
      <ShopContent skeletonCount={products.length} />
    </CatalogHydration>
  );
}