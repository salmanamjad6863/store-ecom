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
import { HOME_SEO } from "@/lib/seo/shop-seo";
import { STORE_SEO, buildDefaultOpenGraph, getSiteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: {
    absolute: `${HOME_SEO.title} | ${STORE_SEO.name}`,
  },
  description: HOME_SEO.description,
  alternates: {
    canonical: getSiteUrl("/"),
  },
  openGraph: buildDefaultOpenGraph(
    `${HOME_SEO.title} | ${STORE_SEO.name}`,
    HOME_SEO.description,
  ),
};

export default async function Home() {
  const { products, catalogWithVariants, featuredHeroItems, phoneModels } = await fetchHomeCatalogData();
  const dehydratedState = buildCatalogDehydratedState({
    products,
    catalogWithVariants,
    featuredHeroItems,
    phoneModels,
  });

  return (
    <>
      <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
      <CatalogHydration state={dehydratedState}>
      <HomeHero skeletonCount={featuredHeroItems.length} />
      <AnnouncementTicker />
      <CollectionSection initialProducts={products} skeletonCount={products.length} />
      <ReviewsSection />
    </CatalogHydration>
    </>
  );
}
