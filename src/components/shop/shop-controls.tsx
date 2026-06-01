"use client";

import { ProductFilters } from "./product-filters";
import { ShopToolbar, type ShopSort } from "./shop-toolbar";

type ShopControlsProps = {
  types: string[];
  search: string;
  onSearchChange: (value: string) => void;
  sort: ShopSort;
  onSortChange: (value: ShopSort) => void;
};

export function ShopControls({
  types,
  search,
  onSearchChange,
  sort,
  onSortChange,
}: ShopControlsProps) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2 sm:mt-8 sm:gap-3">
      <div className="min-w-0 max-w-full overflow-x-auto sm:max-w-none sm:flex-1 sm:overflow-visible">
        <ProductFilters types={types} />
      </div>
      <ShopToolbar
        search={search}
        onSearchChange={onSearchChange}
        sort={sort}
        onSortChange={onSortChange}
        className="w-full sm:ml-auto sm:w-auto"
      />
    </div>
  );
}
