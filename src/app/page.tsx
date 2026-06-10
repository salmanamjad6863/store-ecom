import { AnnouncementTicker } from "@/components/home/announcement-ticker";
import { CollectionSection } from "@/components/home/collection-section";
import { HomeHero } from "@/components/home/home-hero";
import { ReviewsSection } from "@/components/home/reviews-section";
import { fetchFeaturedHeroProductsOnServer } from "@/lib/queries/store-settings-server";
import { fetchProductsOnServer } from "@/lib/queries/products-server";

export default async function Home() {
  const [products, featuredProducts] = await Promise.all([
    fetchProductsOnServer(),
    fetchFeaturedHeroProductsOnServer(),
  ]);

  const collectionLimit = 4;

  return (
    <>
      <HomeHero skeletonCount={featuredProducts.length} />
      <AnnouncementTicker />
      <CollectionSection
        limit={collectionLimit}
        skeletonCount={Math.min(collectionLimit, products.length)}
      />
      <ReviewsSection />
    </>
  );
}
