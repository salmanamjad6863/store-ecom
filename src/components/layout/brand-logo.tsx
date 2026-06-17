import Link from "next/link";

import { env } from "@/lib/env";
import { cn } from "@/lib/utils/cn";

type BrandLogoProps = {
  className?: string;
  light?: boolean;
};

function splitBrandName(name: string): { first: string; accent: string } {
  const trimmed = name.trim();
  const spaceIndex = trimmed.indexOf(" ");

  if (spaceIndex > 0) {
    return {
      first: trimmed.slice(0, spaceIndex),
      accent: trimmed.slice(spaceIndex),
    };
  }

  const splitAt = trimmed.length > 3 ? 3 : Math.ceil(trimmed.length / 2);
  return {
    first: trimmed.slice(0, splitAt),
    accent: trimmed.slice(splitAt),
  };
}

export function BrandLogo({ className, light = false }: BrandLogoProps) {
  const { first, accent } = splitBrandName(env.storeName);

  return (
    <Link
      href="/"
      className={cn(
        "brand-logo font-brand text-[1.65rem] leading-none tracking-[0.02em] sm:text-[1.85rem] md:text-[2rem]",
        light ? "text-cream" : "text-deep",
        className,
      )}
    >
      {first}
      <span className={cn("brand-logo__accent text-accent", light && "text-blush")}>{accent}</span>
    </Link>
  );
}
