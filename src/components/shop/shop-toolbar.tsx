"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
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

export function ShopToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  className,
}: ShopToolbarProps) {
  return (
    <div
      className={cn(
        "mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="relative w-full sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-9"
          aria-label="Search products"
        />
      </div>

      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value as ShopSort)}
        className="h-11 w-full rounded-lg border border-muted/30 bg-surface px-3 text-sm text-foreground sm:w-auto"
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
