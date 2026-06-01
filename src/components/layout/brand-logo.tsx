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
        "font-serif text-xl font-black tracking-tight sm:text-2xl",
        light ? "text-cream" : "text-deep",
        className,
      )}
    >
      {first}
      <span className="text-accent">{accent}</span>
    </Link>
  );
}
