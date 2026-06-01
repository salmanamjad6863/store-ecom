import { cn } from "@/lib/utils/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  className?: string;
  dark?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  lead,
  className,
  dark = false,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-[10px] font-medium uppercase tracking-[0.35em]",
            dark ? "text-blush" : "text-accent",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.75rem]",
          dark ? "text-cream" : "text-deep",
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "mt-4 max-w-xl text-base font-light leading-relaxed sm:text-lg",
            dark ? "text-cream/55" : "text-warm",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
