"use client";

import { ShopToolbar, type ShopSort } from "./shop-toolbar";

type ShopControlsProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sort: ShopSort;
  onSortChange: (value: ShopSort) => void;
};

export function ShopControls({
  search,
  onSearchChange,
  sort,
  onSortChange,
}: ShopControlsProps) {
  return (
    <div className="mt-6 flex justify-end sm:mt-8">
      <ShopToolbar
        search={search}
        onSearchChange={onSearchChange}
        sort={sort}
        onSortChange={onSortChange}
        className="w-full sm:max-w-md"
      />
    </div>
  );
}
