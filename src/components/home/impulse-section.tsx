"use client";

import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import { env } from "@/lib/env";
import { formatCurrency } from "@/lib/utils/format";
import { getProductDisplayPrice, isProductSoldOut } from "@/lib/utils/product";

const triggers = [
  "Limited stock counters displayed on every product to trigger scarcity",
  "Friday Drops create a weekly ritual — she looks forward to it",
  "Cash on delivery — impulse purchases without card friction",
  "Peer reviews and unboxings shown prominently for social proof",
  "Price anchoring — show original price crossed out, always",
  "Free delivery threshold (Rs. 5,000) pushes cart value higher",
] as const;

export function ImpulseSection() {
  const { data: products } = useProducts();
  const spotlight =
    products?.find((p) => !isProductSoldOut(p) && p.quantity > 0 && p.quantity <= 10) ??
    products?.find((p) => !isProductSoldOut(p)) ??
    products?.[0];

  const soldToday = 73;
  const stockLeft = spotlight?.quantity ?? 7;
  const progress =
    stockLeft > 0 ? Math.min(95, Math.round((soldToday / (soldToday + stockLeft)) * 100)) : 73;

  const { amount } = spotlight ? getProductDisplayPrice(spotlight) : { amount: 129900 };

  return (
    <section className="bg-accent px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1">
          <h2 className="font-serif text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
            Built for the
            <br />
            <em className="italic text-white/70">2-second decision.</em>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80">
            Every element is engineered to trigger the &ldquo;I need this right now&rdquo; feeling.
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {triggers.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-white">
                <span className="shrink-0 text-white/60" aria-hidden>
                  →
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full max-w-md flex-1 border border-white/30 bg-white/15 p-6 backdrop-blur-md sm:p-8 lg:mx-auto">
          <p className="text-center text-[10px] uppercase tracking-[0.25em] text-white/70">
            {spotlight ? `${spotlight.name} — ${spotlight.type}` : "Featured drop"}
          </p>
          <p className="mt-2 text-center font-serif text-6xl font-black text-white sm:text-7xl">
            {stockLeft}
          </p>
          <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-white/60">
            pieces left in stock
          </p>
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mb-6 flex justify-between text-[11px] text-white/70">
            <span>{soldToday} sold today</span>
            <span>Selling fast 🔥</span>
          </div>
          {spotlight ? (
            <Button href={`/shop/${spotlight.slug}`} className="w-full bg-deep hover:bg-deep/90">
              Add to Cart · {formatCurrency(amount, env.currency.code, env.currency.locale)}
            </Button>
          ) : (
            <Button href="/shop" className="w-full bg-deep hover:bg-deep/90">
              Shop the Drop
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
