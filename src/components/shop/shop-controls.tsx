"use client";

import { ModelFilters } from "./model-filters";
import { ThemeFilters } from "./theme-filters";
import { ShopToolbar, type ShopSort } from "./shop-toolbar";

type ShopControlsProps = {
  modelIds: string[];
  themes: string[];
  search: string;
  onSearchChange: (value: string) => void;
  sort: ShopSort;
  onSortChange: (value: ShopSort) => void;
};

export function ShopControls({
  modelIds,
  themes,
  search,
  onSearchChange,
  sort,
  onSortChange,
}: ShopControlsProps) {
  return (
    <div className="mt-6 space-y-4 sm:mt-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
              Category — iPhone model
            </p>
            <ModelFilters modelIds={modelIds} />
          </div>
          <ThemeFilters themes={themes} />
        </div>
        <ShopToolbar
          search={search}
          onSearchChange={onSearchChange}
          sort={sort}
          onSortChange={onSortChange}
          className="w-full lg:w-auto"
        />
      </div>
    </div>
  );
}
