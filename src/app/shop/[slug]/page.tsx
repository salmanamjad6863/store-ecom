import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/shop/product-detail";
import { JsonLd } from "@/components/seo/json-ld";
import { fetchProductWithVariantsBySlugOnServer } from "@/lib/queries/products-server";
import { buildProductJsonLd, buildProductMetadata } from "@/lib/seo/product-seo";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductWithVariantsBySlugOnServer(slug);

  if (!product || product.hidden) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  return buildProductMetadata(product);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductWithVariantsBySlugOnServer(slug);

  if (!product || product.hidden) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildProductJsonLd(product)} />
      <ProductDetail slug={slug} initialProduct={product} />
    </>
  );
}
