import type { Metadata } from "next";

import { AnnouncementTicker } from "@/components/home/announcement-ticker";
import { CollectionSection } from "@/components/home/collection-section";
import { HomeHero } from "@/components/home/home-hero";
import { ReviewsSection } from "@/components/home/reviews-section";
import { CatalogHydration } from "@/components/providers/catalog-hydration";
import { JsonLd } from "@/components/seo/json-ld";
import { fetchHomeCatalogData } from "@/lib/queries/home-catalog-server";
import { buildCatalogDehydratedState } from "@/lib/queries/hydrate-catalog";
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/product-seo";
import { STORE_SEO, buildDefaultOpenGraph, getSiteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: {
    absolute: `${STORE_SEO.name} — Premium iPhone Cases in Pakistan`,
  },
  description: STORE_SEO.defaultDescription,
  alternates: {
    canonical: getSiteUrl("/"),
  },
  openGraph: buildDefaultOpenGraph(
    `${STORE_SEO.name} — Premium iPhone Cases in Pakistan`,
    STORE_SEO.defaultDescription,
  ),
};

export default async function Home() {
  const { products, featuredProducts, phoneModels } = await fetchHomeCatalogData();
  const collectionLimit = 4;
  const dehydratedState = buildCatalogDehydratedState({
    products,
    featuredProducts,
    phoneModels,
  });

  return (
    <>
      <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
      <CatalogHydration state={dehydratedState}>
      <HomeHero skeletonCount={featuredProducts.length} />
      <AnnouncementTicker />
      <CollectionSection
        limit={collectionLimit}
        initialProducts={products}
        skeletonCount={Math.min(collectionLimit, products.length)}
      />
      <ReviewsSection />
    </CatalogHydration>
    </>
  );
}
