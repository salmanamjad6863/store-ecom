"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils/cn";

type ThemeFiltersProps = {
  themes: string[];
};

export function ThemeFilters({ themes }: ThemeFiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTheme = searchParams.get("theme");

  const buildHref = (theme?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (theme) {
      params.set("theme", theme);
    } else {
      params.delete("theme");
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  if (themes.length === 0) {
    return null;
  }

  const chips = [
    { label: "All designs", value: undefined as string | undefined },
    ...themes.map((theme) => ({ label: theme, value: theme })),
  ];

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
        Design
      </p>
      <div className="-mx-1 flex w-max gap-2 overflow-x-auto px-1 pb-0.5 sm:flex-wrap">
        {chips.map((chip) => {
          const isActive = chip.value ? activeTheme === chip.value : !activeTheme;
          return (
            <Link
              key={chip.value ?? "__all__"}
              href={buildHref(chip.value)}
              className={cn(
                "shrink-0 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] transition-colors sm:text-[11px]",
                isActive
                  ? "border border-deep bg-deep text-white"
                  : "border border-deep/12 bg-white text-deep/75 hover:border-accent/35",
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
