"use client";

import { Button } from "@/components/ui/button";
import { useFeaturedHeroProducts } from "@/hooks/use-store-settings";

import { HeroFeaturedCard, HeroProductCardSkeleton } from "./hero-featured-card";

export function HomeHero() {
  const { data: featured, isPending } = useFeaturedHeroProducts();
  const items = featured ?? [];

  return (
    <section className="grid min-h-[min(100vh,900px)] lg:grid-cols-2">
      <div className="relative flex flex-col justify-center overflow-hidden bg-deep px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 max-w-lg">
          <span className="animate-fade-up mb-8 inline-block border border-gold/40 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.35em] text-gold">
            ✦ Pakistan&apos;s Finest · Est. 2025
          </span>

          <h1 className="animate-fade-up font-serif text-4xl font-black leading-[1.02] text-cream sm:text-5xl lg:text-6xl xl:text-7xl [animation-delay:0.15s]">
            Carry Her
            <em className="mt-1 block font-serif text-4xl italic text-blush sm:text-5xl lg:text-6xl xl:text-7xl">
              Story.
            </em>
          </h1>

          <p className="animate-fade-up font-display mt-6 text-lg italic leading-relaxed text-cream/55 sm:text-xl [animation-delay:0.3s]">
            iPhone covers crafted for the woman who notices the details — and makes sure everyone
            else does too.
          </p>

          <div className="animate-fade-up mt-10 flex flex-wrap gap-3 sm:gap-4 [animation-delay:0.45s]">
            <Button href="/shop" size="lg">
              Shop the Drop
            </Button>
            <Button href="/shop" variant="outlineLight" size="lg">
              View Collection
            </Button>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center overflow-hidden bg-soft px-4 py-12 sm:px-8 sm:py-16 lg:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(232,196,184,0.45)_0%,transparent_60%),radial-gradient(ellipse_at_70%_80%,rgba(201,169,110,0.15)_0%,transparent_50%)]"
          aria-hidden
        />

        <div className="relative z-10 grid w-full max-w-md grid-cols-3 gap-3 sm:max-w-lg sm:gap-4">
          {isPending && items.length === 0
            ? [0, 1, 2].map((i) => <HeroProductCardSkeleton key={i} raised={i === 1} />)
            : null}

          {!isPending && items.length > 0
            ? items.map((product, index) => (
                <HeroFeaturedCard
                  key={`${product.id}-${index}`}
                  product={product}
                  index={index}
                  raised={index === 1}
                />
              ))
            : null}

          {!isPending && items.length === 0
            ? [0, 1, 2].map((i) => <HeroProductCardSkeleton key={i} raised={i === 1} />)
            : null}
        </div>
      </div>
    </section>
  );
}
