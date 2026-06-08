"use client";

import { cn } from "@/lib/utils/cn";
import type { PhoneModel } from "@/types/phone-model";

type ModelMultiSelectProps = {
  models: PhoneModel[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  caseCounts?: Record<string, number>;
  disabled?: boolean;
};

export function ModelMultiSelect({
  models,
  selectedIds,
  onChange,
  caseCounts,
  disabled,
}: ModelMultiSelectProps) {
  const toggle = (modelId: string) => {
    if (disabled) {
      return;
    }

    if (selectedIds.includes(modelId)) {
      onChange(selectedIds.filter((id) => id !== modelId));
      return;
    }

    onChange([...selectedIds, modelId]);
  };

  const selectAll = () => {
    onChange(models.filter((model) => model.active).map((model) => model.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  const activeModels = models.filter((model) => model.active);

  if (activeModels.length === 0) {
    return (
      <p className="text-sm text-muted">
        No iPhone models yet. Add models in Admin → iPhone models first.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={selectAll}
          className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
        >
          Select all
        </button>
        <span className="text-muted">·</span>
        <button
          type="button"
          disabled={disabled}
          onClick={clearAll}
          className="text-xs font-medium text-muted hover:text-foreground disabled:opacity-50"
        >
          Clear
        </button>
        <span className="text-xs text-muted">
          ({selectedIds.length} of {activeModels.length} selected)
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {activeModels.map((model) => {
          const isSelected = selectedIds.includes(model.id);
          const caseCount = caseCounts?.[model.id];

          return (
            <label
              key={model.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                isSelected
                  ? "border-accent bg-accent/5"
                  : "border-muted/20 bg-background hover:border-accent/30",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-accent"
                checked={isSelected}
                disabled={disabled}
                onChange={() => toggle(model.id)}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{model.name}</span>
                {caseCount !== undefined ? (
                  <span className="block text-xs text-muted">
                    {caseCount} case design{caseCount === 1 ? "" : "s"} in store
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
