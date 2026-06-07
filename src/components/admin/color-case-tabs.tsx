"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

import type { ColorCaseEntry } from "./color-case-editor";

type ColorCaseTabsProps = {
  entries: ColorCaseEntry[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRemove?: (index: number) => void;
};

export function ColorCaseTabs({
  entries,
  activeIndex,
  onSelect,
  onAdd,
  onRemove,
}: ColorCaseTabsProps) {
  return (
    <div className="space-y-2">
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {entries.map((entry, index) => {
          const isActive = index === activeIndex;
          const label = entry.colorName.trim() || `Color ${index + 1}`;
          const canRemove = entries.length > 1;

          return (
            <div key={entry.colorDocId ?? `tab-${index}`} className="relative shrink-0">
              <button
                type="button"
                onClick={() => onSelect(index)}
                className={cn(
                  "group flex w-[88px] flex-col items-center gap-2 rounded-xl border-2 p-2 transition-all sm:w-[100px]",
                  isActive
                    ? "border-accent bg-accent/5 shadow-sm"
                    : "border-muted/25 bg-background hover:border-accent/35",
                )}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-muted/20 bg-soft">
                  {entry.images[0] ? (
                    <Image
                      src={entry.images[0]}
                      alt=""
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center"
                      style={{ backgroundColor: entry.colorHex }}
                    >
                      {!entry.colorName ? (
                        <ImagePlus className="h-5 w-5 text-white/70" strokeWidth={1.5} />
                      ) : null}
                    </div>
                  )}
                  <span
                    className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: entry.colorHex }}
                  />
                </div>
                <span
                  className={cn(
                    "max-w-full truncate text-[11px] font-medium",
                    isActive ? "text-deep" : "text-muted",
                  )}
                >
                  {label}
                </span>
              </button>
              {isActive && canRemove && onRemove ? (
                <button
                  type="button"
                  aria-label={`Remove ${label}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove(index);
                  }}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-muted/30 bg-white text-muted shadow-sm hover:border-danger hover:text-danger"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          );
        })}

        <button
          type="button"
          onClick={onAdd}
          className="flex w-[88px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/35 bg-accent/5 p-2 text-accent transition-colors hover:border-accent hover:bg-accent/10 sm:w-[100px]"
        >
          <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-accent/30">
            <span className="text-2xl leading-none">+</span>
          </div>
          <span className="text-[11px] font-medium">Add color</span>
        </button>
      </div>
      <p className="text-xs text-muted">
        {entries.length} color{entries.length === 1 ? "" : "s"} · tap a card to edit
      </p>
    </div>
  );
}
