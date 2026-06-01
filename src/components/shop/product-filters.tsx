"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { normalizeProductTypes } from "@/lib/shop/product-types";
import { cn } from "@/lib/utils/cn";

type ProductFiltersProps = {
  types: string[];
};

export function ProductFilters({ types }: ProductFiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type");

  const uniqueTypes = useMemo(() => normalizeProductTypes(types), [types]);

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
    { label: "All", value: undefined as string | undefined },
    ...uniqueTypes.map((type) => ({ label: type, value: type })),
  ];

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-0.5 sm:mx-0 sm:overflow-visible">
      <div className="flex w-max min-w-full gap-2 sm:w-auto sm:flex-wrap">
        {chips.map((chip) => {
          const isActive = chip.value ? activeType === chip.value : !activeType;
          const chipKey = chip.value ?? "__all__";

          return (
            <Link
              key={chipKey}
              href={buildHref(chip.value)}
              className={cn(
                "shrink-0 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] transition-colors sm:px-3.5 sm:py-2 sm:text-[11px]",
                isActive
                  ? "border border-accent bg-accent text-white"
                  : "border border-deep/12 bg-white text-deep/75 hover:border-accent/35 hover:text-deep",
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
