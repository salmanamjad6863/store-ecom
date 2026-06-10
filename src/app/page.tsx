import { AnnouncementTicker } from "@/components/home/announcement-ticker";
import { CollectionSection } from "@/components/home/collection-section";
import { HomeHero } from "@/components/home/home-hero";
import { ReviewsSection } from "@/components/home/reviews-section";
import { CatalogHydration } from "@/components/providers/catalog-hydration";
import { fetchHomeCatalogData } from "@/lib/queries/home-catalog-server";
import { buildCatalogDehydratedState } from "@/lib/queries/hydrate-catalog";

export default async function Home() {
  const { products, featuredProducts, phoneModels } = await fetchHomeCatalogData();
  const collectionLimit = 4;
  const dehydratedState = buildCatalogDehydratedState({
    products,
    featuredProducts,
    phoneModels,
  });

  return (
    <CatalogHydration state={dehydratedState}>
      <HomeHero skeletonCount={featuredProducts.length} />
      <AnnouncementTicker />
      <CollectionSection
        limit={collectionLimit}
        skeletonCount={Math.min(collectionLimit, products.length)}
      />
      <ReviewsSection />
    </CatalogHydration>
  );
}
