import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/shop/product-detail";
import { ShopContent } from "@/components/shop/shop-content";
import { CatalogHydration } from "@/components/providers/catalog-hydration";
import { JsonLd } from "@/components/seo/json-ld";
import { buildCatalogDehydratedState } from "@/lib/queries/hydrate-catalog";
import { resolveCatalogWithVariants } from "@/lib/queries/catalog-variants-server";
import { fetchPhoneModelsOnServer } from "@/lib/queries/phone-models-server";
import { fetchProductWithVariantsBySlugOnServer, fetchProductsOnServer } from "@/lib/queries/products-server";
import {
  buildModelCollectionMetadata,
  getModelCollectionPath,
  parseModelCollectionSlug,
  resolveModelFromCollectionSlug,
} from "@/lib/seo/collections";
import { buildBreadcrumbJsonLd } from "@/lib/seo/faq";
import { buildProductJsonLd, buildProductMetadata } from "@/lib/seo/product-seo";

type ShopSlugPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ theme?: string }>;
};

export async function generateStaticParams() {
  const phoneModels = await fetchPhoneModelsOnServer();
  return phoneModels.map((model) => ({
    slug: `${model.slug}-cases`,
  }));
}

export async function generateMetadata({ params, searchParams }: ShopSlugPageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  if (parseModelCollectionSlug(slug)) {
    const phoneModels = await fetchPhoneModelsOnServer();
    const model = resolveModelFromCollectionSlug(slug, phoneModels);

    if (!model) {
      return { title: "Collection not found", robots: { index: false, follow: false } };
    }

    const metadata = buildModelCollectionMetadata(model);

    if (query.theme) {
      return {
        ...metadata,
        robots: { index: false, follow: true },
      };
    }

    return metadata;
  }

  const product = await fetchProductWithVariantsBySlugOnServer(slug);

  if (!product || product.hidden) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  return buildProductMetadata(product);
}

export default async function ShopSlugPage({ params, searchParams }: ShopSlugPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  if (parseModelCollectionSlug(slug)) {
    const phoneModels = await fetchPhoneModelsOnServer();
    const model = resolveModelFromCollectionSlug(slug, phoneModels);

    if (!model) {
      notFound();
    }

    const listFilters = {
      modelId: model.id,
      theme: query.theme,
    };

    const [products, catalogProducts] = await Promise.all([
      fetchProductsOnServer(listFilters),
      fetchProductsOnServer(),
    ]);

    const catalogWithVariants = await resolveCatalogWithVariants(catalogProducts);

    const dehydratedState = buildCatalogDehydratedState({
      products,
      catalogProducts,
      catalogWithVariants,
      listFilters,
      phoneModels,
    });

    const collectionPath = getModelCollectionPath(model.slug);

    return (
      <>
        <JsonLd
          data={buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: `${model.name} Covers`, path: collectionPath },
          ])}
        />
        <CatalogHydration state={dehydratedState}>
          <ShopContent
            skeletonCount={products.length}
            initialProducts={products}
            fixedModelId={model.id}
            theme={query.theme}
            srTitle={`${model.name} Covers`}
            heading={{
              eyebrow: model.name,
              title: (
                <>
                  Designed to be <em className="italic text-accent">irresistible</em>
                </>
              ),
              lead: "Browse by design. Each color is its own product.",
            }}
          />
        </CatalogHydration>
      </>
    );
  }

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
