"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils/cn";

type ProductFiltersProps = {
  types: string[];
};

export function ProductFilters({ types }: ProductFiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type");

  const buildHref = (type?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (type) {
      params.set("type", type);
    } else {
      params.delete("type");
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const chips = [{ label: "All", value: undefined }, ...types.map((type) => ({ label: type, value: type }))];

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => {
        const isActive = chip.value ? activeType === chip.value : !activeType;

        return (
          <Link
            key={chip.label}
            href={buildHref(chip.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-accent bg-accent text-white"
                : "border-muted/30 bg-surface text-foreground hover:bg-background",
            )}
          >
            {chip.label}
          </Link>
        );
      })}
    </div>
  );
}
