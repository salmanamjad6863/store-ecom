"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { usePhoneModels } from "@/hooks/use-phone-models";
import { buildShopModelHref, getActiveModelIdFromPath } from "@/lib/seo/collections";
import { cn } from "@/lib/utils/cn";

type ModelFiltersProps = {
  modelIds: string[];
};

export function ModelFilters({ modelIds }: ModelFiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeModelId = getActiveModelIdFromPath(pathname, searchParams.get("model"));
  const activeTheme = searchParams.get("theme");
  const { data: phoneModels = [] } = usePhoneModels();

  const filterModels = useMemo(
    () =>
      phoneModels.filter((model) => modelIds.includes(model.id)),
    [phoneModels, modelIds],
  );

  const buildHref = (modelId?: string) => buildShopModelHref(modelId, activeTheme);

  if (filterModels.length === 0) {
    return null;
  }

  const chips = [
    { label: "All models", value: undefined as string | undefined },
    ...filterModels.map((model) => ({ label: model.name, value: model.id })),
  ];

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-0.5 sm:mx-0 sm:overflow-visible">
      <div className="flex w-max min-w-full gap-2 sm:w-auto sm:flex-wrap">
        {chips.map((chip) => {
          const isActive = chip.value ? activeModelId === chip.value : !activeModelId;
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
