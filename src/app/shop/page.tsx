import { ShopContent } from "@/components/shop/shop-content";
import { CatalogHydration } from "@/components/providers/catalog-hydration";
import { buildCatalogDehydratedState } from "@/lib/queries/hydrate-catalog";
import { fetchPhoneModelsOnServer } from "@/lib/queries/phone-models-server";
import { fetchProductsOnServer } from "@/lib/queries/products-server";

type ShopPageProps = {
  searchParams: Promise<{
    model?: string;
    theme?: string;
  }>;
};

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
