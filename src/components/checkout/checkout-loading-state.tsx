import { Container } from "@/components/ui/container";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";

export function CheckoutLoadingState() {
  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16">
      <Spinner size="lg" />
      <Text variant="muted" as="p">
        Loading checkout…
      </Text>
    </Container>
  );
}
