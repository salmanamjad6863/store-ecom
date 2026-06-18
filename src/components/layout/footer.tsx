import Link from "next/link";

import { env } from "@/lib/env";

import { BrandLogo } from "./brand-logo";
import { FooterCartLink } from "./footer-cart-link";

const helpLinks = [
  { href: "/track-order", label: "Track Order" },
  { type: "cart" as const, label: "Cart" },
  { href: "/checkout", label: "Checkout" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-deep text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:gap-12 lg:px-10 lg:py-16">
        <div className="sm:col-span-2 lg:col-span-1">
          <BrandLogo light className="mb-4 inline-block" />
          <p className="max-w-sm text-sm leading-relaxed text-cream/40">
            iPhone covers designed for the Pakistani woman who knows exactly what she wants — and
            doesn&apos;t wait to get it.
          </p>
          <div className="mt-6">
            <a
              href="https://www.instagram.com/ibloomelara/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-cream/10 bg-cream/5 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-cream/50 transition-colors hover:border-cream/20 hover:text-blush"
            >
              Instagram
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-[10px] uppercase tracking-[0.3em] text-cream/35">Help</h4>
          <ul className="space-y-2.5">
            {helpLinks.map((link) => (
              <li key={link.label}>
                {"type" in link && link.type === "cart" ? (
                  <FooterCartLink />
                ) : "href" in link ? (
                  <Link
                    href={link.href}
                    className="text-sm text-cream/55 transition-colors hover:text-blush"
                  >
                    {link.label}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-[10px] uppercase tracking-[0.3em] text-cream/35">Brand</h4>
          <ul className="space-y-2.5 text-sm text-cream/55">
            <li>{env.storeName}</li>
            <li>Cash on delivery</li>
            <li>Free delivery Rs. 5,000+</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-left lg:px-10">
          <p className="text-[11px] tracking-wide text-cream/25">
            © {year} {env.storeName}. All rights reserved.
          </p>
          <p className="text-[11px] tracking-wide text-cream/25">Made for her.</p>
        </div>
      </div>
    </footer>
  );
}
