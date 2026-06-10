import { ShopContent } from "@/components/shop/shop-content";
import { fetchProductsOnServer } from "@/lib/queries/products-server";

type ShopPageProps = {
  searchParams: Promise<{
    model?: string;
    theme?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const products = await fetchProductsOnServer({
    modelId: params.model,
    theme: params.theme,
  });

  return <ShopContent skeletonCount={products.length} />;
}
