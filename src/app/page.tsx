import { AnnouncementTicker } from "@/components/home/announcement-ticker";
import { CollectionSection } from "@/components/home/collection-section";
import { HomeHero } from "@/components/home/home-hero";
import { ImpulseSection } from "@/components/home/impulse-section";
import { ReviewsSection } from "@/components/home/reviews-section";

export default function Home() {
  return (
    <>
      <HomeHero />
      <AnnouncementTicker />
      <CollectionSection limit={4} />
      <ImpulseSection />
      <ReviewsSection />
    </>
  );
}
