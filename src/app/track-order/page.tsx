import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { TrackOrderForm } from "@/components/orders/track-order-form";

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
