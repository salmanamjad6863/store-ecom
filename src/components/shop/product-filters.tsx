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

  const chips = [
    { label: "All", value: undefined },
    ...types.map((type) => ({ label: type, value: type })),
  ];

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1 sm:mx-0 sm:overflow-visible sm:pb-0">
      <div className="flex w-max min-w-full gap-2 sm:w-auto sm:flex-wrap">
        {chips.map((chip) => {
          const isActive = chip.value ? activeType === chip.value : !activeType;

          return (
            <Link
              key={chip.label}
              href={buildHref(chip.value)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm",
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
    </div>
  );
}
