import Link from "next/link";

import { env } from "@/lib/env";
import { cn } from "@/lib/utils/cn";

import { Container } from "../ui/container";

import { CartNavLink } from "./cart-nav-link";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/track-order", label: "Track Order" },
  { href: "/account", label: "Account" },
] as const;

export function Header() {
  return (
    <header className="border-b border-muted/20 bg-surface">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-lg font-semibold text-foreground">
          {env.storeName}
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background",
              )}
            >
              {link.label}
            </Link>
          ))}
          <CartNavLink />
        </nav>
      </Container>
    </header>
  );
}
