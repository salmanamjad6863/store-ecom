import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";

export default function ProductNotFound() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-lg text-center">
        <Text variant="h1" as="h1">
          Product not found
        </Text>
        <Text variant="muted" as="p" className="mt-3">
          This product may have been removed or the link is incorrect.
        </Text>
        <Button href="/shop" variant="secondary" className="mt-8">
          Back to shop
        </Button>
      </div>
    </Container>
  );
}
