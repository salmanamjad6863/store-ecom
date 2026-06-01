"use client";

import { ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type ShopSort = "newest" | "price-asc" | "price-desc";

type ShopToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sort: ShopSort;
  onSortChange: (value: ShopSort) => void;
  className?: string;
};

const SORT_OPTIONS: { value: ShopSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const fieldClass =
  "flex h-10 items-center border border-deep/12 bg-white transition-colors focus-within:border-accent/40 focus-within:ring-1 focus-within:ring-accent/15";

export function ShopToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  className,
}: ShopToolbarProps) {
  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)}>
      <div className={cn(fieldClass, "relative min-w-0 flex-1 px-2.5 sm:w-44 sm:flex-none md:w-52")}>
        <Search
          className="pointer-events-none h-3.5 w-3.5 shrink-0 text-warm/60"
          strokeWidth={1.5}
          aria-hidden
        />
        <input
          id="shop-search"
          type="search"
          placeholder="Search…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Search products"
          className="min-w-0 flex-1 border-0 bg-transparent py-2 pl-2 text-sm text-deep placeholder:text-warm/45 focus:outline-none focus:ring-0"
        />
      </div>

      <div className={cn(fieldClass, "relative w-[9.5rem] shrink-0 px-2.5 sm:w-40")}>
        <select
          id="shop-sort"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as ShopSort)}
          aria-label="Sort products"
          className="w-full cursor-pointer appearance-none border-0 bg-transparent py-2 pr-6 text-sm text-deep focus:outline-none focus:ring-0"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-warm/60"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
    </div>
  );
}
