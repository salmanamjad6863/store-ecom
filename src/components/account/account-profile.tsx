"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/use-auth";

export function AccountProfile() {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Card className="mx-auto max-w-md space-y-6">
      <div className="space-y-2">
        <Text variant="h2" as="h2" className="text-xl">
          Your account
        </Text>
        <Text variant="muted" as="p">
          Signed in as <span className="font-medium text-foreground">{user.email}</span>
        </Text>
      </div>

      <div className="flex flex-col gap-3">
        <Button href="/account/orders" variant="secondary">
          View order history
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            void signOut();
          }}
        >
          Sign out
        </Button>
      </div>

      <Text variant="small" as="p" className="text-muted">
        <Link href="/shop" className="text-accent hover:underline">
          Continue shopping
        </Link>
      </Text>
    </Card>
  );
}
