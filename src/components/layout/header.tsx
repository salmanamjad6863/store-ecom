import Link from "next/link";

import { env } from "@/lib/env";
import { cn } from "@/lib/utils/cn";

import { Container } from "../ui/container";

import { CartNavLink } from "./cart-nav-link";

const navLinks = [
  { href: "/shop", label: "Shop", shortLabel: "Shop" },
  { href: "/track-order", label: "Track Order", shortLabel: "Track" },
] as const;

export function Header() {
  return (
    <header className="border-b border-muted/20 bg-surface">
      <Container className="flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-4">
        <Link
          href="/"
          className="max-w-[40vw] truncate text-base font-semibold text-foreground sm:max-w-none sm:text-lg"
        >
          {env.storeName}
        </Link>

        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-2 py-2 text-xs font-medium text-foreground transition-colors hover:bg-background sm:px-3 sm:text-sm",
              )}
            >
              <span className="sm:hidden">{link.shortLabel}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
          <CartNavLink />
        </nav>
      </Container>
    </header>
  );
}
