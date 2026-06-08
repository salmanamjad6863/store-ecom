"use client";

import { cn } from "@/lib/utils/cn";
import type { PhoneModel } from "@/types/phone-model";

type ModelSelectorProps = {
  models: PhoneModel[];
  selectedModelId: string;
  onSelect: (modelId: string) => void;
  disabled?: boolean;
};

export function ModelSelector({
  models,
  selectedModelId,
  onSelect,
  disabled,
}: ModelSelectorProps) {
  if (models.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-warm">
        iPhone model
      </p>
      <div className="flex flex-wrap gap-2">
        {models.map((model) => {
          const isActive = model.id === selectedModelId;

          return (
            <button
              key={model.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(model.id)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm",
                isActive
                  ? "border-accent bg-accent text-white"
                  : "border-deep/15 bg-white text-deep/80 hover:border-accent/40 hover:text-deep",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              {model.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
