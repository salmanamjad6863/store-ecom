import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";

export default function OrderNotFound() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-lg text-center">
        <Text variant="h1" as="h1">
          Order not found
        </Text>
        <Text variant="muted" as="p" className="mt-3">
          We could not find an order with that number. Check the link or track your order.
        </Text>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href="/track-order">Track order</Button>
          <Button href="/shop" variant="secondary">
            Back to shop
          </Button>
        </div>
      </div>
    </Container>
  );
}
