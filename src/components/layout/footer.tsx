import Link from "next/link";

import { env } from "@/lib/env";

import { Container } from "../ui/container";
import { Text } from "../ui/text";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-muted/20 bg-surface">
      <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <Text variant="small" as="p">
          © {year} {env.storeName}. All rights reserved.
        </Text>
        <nav className="flex flex-wrap gap-4">
          <Link href="/shop" className="text-sm text-muted hover:text-foreground">
            Shop
          </Link>
          <Link href="/track-order" className="text-sm text-muted hover:text-foreground">
            Track Order
          </Link>
          <Link href="/account" className="text-sm text-muted hover:text-foreground">
            Account
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
