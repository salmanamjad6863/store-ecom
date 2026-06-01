"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

import { BrandLogo } from "./brand-logo";
import { CartNavLink } from "./cart-nav-link";

const navLinks = [
  { href: "/shop", label: "Collection" },
  { href: "/shop", label: "Drops" },
  { href: "/track-order", label: "Track Order" },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-deep/10 bg-cream/95 backdrop-blur-md">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-6 sm:h-16 sm:px-10 lg:px-14">
        <BrandLogo />

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
          <CartNavLink className="hidden sm:inline-flex" />
          <Button href="/shop" size="sm" className="hidden sm:inline-flex">
            Shop Now ✦
          </Button>
          <CartNavLink className="sm:hidden" />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-none border border-deep/10 text-deep md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-deep/10 bg-cream md:hidden",
          menuOpen ? "block" : "hidden",
        )}
      >
        <nav className="flex w-full flex-col gap-1 px-6 py-3 sm:px-10 lg:px-14">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-foreground/70"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Button href="/shop" size="sm" className="mt-2 w-full" onClick={() => setMenuOpen(false)}>
            Shop Now ✦
          </Button>
          <div className="mt-2 border-t border-deep/10 pt-3">
            <CartNavLink />
          </div>
        </nav>
      </div>
    </header>
  );
}
