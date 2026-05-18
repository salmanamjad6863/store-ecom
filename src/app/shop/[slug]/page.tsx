import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/shop/product-detail";
import { fetchProductBySlugOnServer } from "@/lib/queries/products-server";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlugOnServer(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail slug={slug} initialProduct={product} />;
}
