"use client";

import { Container } from "@/components/ui/container";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/use-auth";

import { AccountAuthPanel } from "./account-auth-panel";
import { AccountProfile } from "./account-profile";

export function AccountPageContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container className="flex justify-center py-16">
        <Spinner size="lg" />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-12">
      <div className="mb-8 text-center">
        <Text variant="h1" as="h1">
          Account
        </Text>
        <Text variant="muted" as="p" className="mt-2">
          Sign in to view your order history, or continue as a guest at checkout.
        </Text>
      </div>

      {user ? <AccountProfile /> : <AccountAuthPanel />}
    </Container>
  );
}
