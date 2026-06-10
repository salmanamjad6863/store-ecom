"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useModelFilterDrawer } from "@/providers/model-filter-drawer-provider";

import { BrandLogo } from "./brand-logo";
import { CartNavLink } from "./cart-nav-link";

const navLinks = [
  { href: "/shop", label: "Collection" },
  { href: "/track-order", label: "Track Order" },
] as const;

export function Header() {
  const { toggleDrawer, isOpen: isFilterDrawerOpen } = useModelFilterDrawer();

  return (
    <header className="sticky top-0 z-50 border-b border-deep/10 bg-cream/95 backdrop-blur-md">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-6 sm:h-16 sm:px-10 lg:px-14">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-deep/10 text-deep transition-colors hover:border-accent/35 hover:text-accent"
            aria-expanded={isFilterDrawerOpen}
            aria-label={isFilterDrawerOpen ? "Close iPhone model filters" : "Open iPhone model filters"}
            onClick={toggleDrawer}
          >
            {isFilterDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <BrandLogo />
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs font-medium uppercase tracking-[0.15em] text-foreground/60 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <CartNavLink />
          <Button href="/shop" size="sm" className="hidden sm:inline-flex">
            Shop Now ✦
          </Button>
        </div>
      </div>
    </header>
  );
}
