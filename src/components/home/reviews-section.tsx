import { SectionHeading } from "@/components/ui/section-heading";

const reviews = [
  {
    stars: 5,
    text: "Ordered on Friday night, delivered Saturday morning. The case is even more gorgeous in person. Everyone at uni has been asking where I got it.",
    author: "Aisha K.",
    location: "Lahore, Pakistan",
  },
  {
    stars: 5,
    text: "I keep seeing the Friday drops on Instagram and I literally cannot stop buying. The quality is actually insane for the price.",
    author: "Maryam Z.",
    location: "Karachi, Pakistan",
  },
  {
    stars: 5,
    text: "Finally a brand that actually gets Pakistani girls. Not trying to copy some western brand — it feels like it was made for us.",
    author: "Fatima N.",
    location: "Islamabad, Pakistan",
  },
] as const;

function Stars({ count }: { count: number }) {
  return (
    <span className="text-sm tracking-widest text-gold" aria-label={`${count} out of 5 stars`}>
      {"★".repeat(count)}
      {"☆".repeat(5 - count)}
    </span>
  );
}

export function ReviewsSection() {
  return (
    <section className="bg-surface px-4 py-14 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Her Words"
          title={
            <>
              14,000+ girls <em className="italic text-accent">obsessed</em>
            </>
          }
          className="mb-10 sm:mb-14"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.author}
              className="relative bg-soft p-6 sm:p-8"
            >
              <span
                className="pointer-events-none absolute left-4 top-0 font-serif text-7xl leading-none text-blush/60"
                aria-hidden
              >
                &ldquo;
              </span>
              <Stars count={review.stars} />
              <p className="relative z-10 mt-4 text-sm italic leading-relaxed text-foreground">
                {review.text}
              </p>
              <p className="mt-5 text-xs font-medium uppercase tracking-wider text-warm">
                {review.author}
              </p>
              <p className="mt-0.5 text-[11px] text-muted/60">{review.location}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
