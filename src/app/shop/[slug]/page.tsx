import { ProductDetail } from "@/components/shop/product-detail";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage(_props: ProductPageProps) {
  return <ProductDetail />;
}
