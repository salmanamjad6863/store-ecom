import { FeaturedProducts } from "@/components/shop/featured-products";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { env } from "@/lib/env";

export default function Home() {
  return (
    <>
      <Container className="flex flex-col items-center gap-6 py-10 text-center sm:gap-8 sm:py-24">
        <div className="flex max-w-2xl flex-col gap-3 sm:gap-4">
          <Text variant="h1" as="h1" className="text-2xl sm:text-3xl">
            Welcome to {env.storeName}
          </Text>
          <Text variant="muted" as="p">
            Discover quality products with simple cash on delivery checkout. Browse the shop,
            add items to your cart, and track your order anytime.
          </Text>
        </div>
        <Button href="/shop" size="lg">
          Browse shop
        </Button>
      </Container>
      <FeaturedProducts />
    </>
  );
}
