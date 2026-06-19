import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { TrackOrderForm } from "@/components/orders/track-order-form";
import { buildDefaultOpenGraph, getSiteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track your iBloom Elara order status with your order number.",
  alternates: {
    canonical: getSiteUrl("/track-order"),
  },
  openGraph: buildDefaultOpenGraph(
    "Track Order",
    "Track your iBloom Elara order status with your order number.",
    "/track-order",
  ),
};

export default function TrackOrderPage() {
  return (
    <Container className="py-10 sm:py-12">
      <div className="mb-8 text-center">
        <Text variant="h1" as="h1">
          Track order
        </Text>
      </div>
      <TrackOrderForm />
    </Container>
  );
}
