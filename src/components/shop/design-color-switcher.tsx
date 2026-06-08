"use client";

import { cn } from "@/lib/utils/cn";
import { isColorSoldOut } from "@/lib/utils/product-colors";
import type { ProductColor } from "@/types/product-color";
import type { ProductVariant } from "@/types/product-variant";

type DesignColorSwitcherProps = {
  theme: string;
  colors: ProductColor[];
  variants: ProductVariant[];
  activeColorId: string;
  onSelect: (colorId: string) => void;
  className?: string;
};

export function DesignColorSwitcher({
  theme,
  colors,
  variants,
  activeColorId,
  onSelect,
  className,
}: DesignColorSwitcherProps) {
  if (colors.length <= 1) {
    return null;
  }

  const activeColor = colors.find((color) => color.colorId === activeColorId) ?? colors[0];

  return (
    <section
      className={cn(
        "rounded-2xl border border-deep/10 bg-white/80 px-5 py-6 backdrop-blur-sm sm:px-8 sm:py-7",
        className,
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
            {theme}
          </p>
          <p className="mt-1 font-serif text-xl text-deep sm:text-2xl">
            {activeColor.colorName}
          </p>
          <p className="mt-1 text-sm text-muted">Tap a color to preview this case</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {colors.map((color) => {
            const isActive = color.colorId === activeColorId;
            const soldOut = isColorSoldOut(color, variants);

            return (
              <button
                key={color.id}
                type="button"
                title={soldOut ? `${color.colorName} — sold out` : color.colorName}
                aria-label={`${color.colorName}${isActive ? " (selected)" : ""}`}
                aria-pressed={isActive}
                onClick={() => onSelect(color.colorId)}
                className={cn(
                  "group flex flex-col items-center gap-2 transition-transform duration-300",
                  isActive ? "scale-105" : "hover:scale-105",
                  soldOut && !isActive && "opacity-45",
                )}
              >
                <span
                  className={cn(
                    "relative h-11 w-11 rounded-full border-2 transition-all duration-300 sm:h-12 sm:w-12",
                    isActive
                      ? "border-accent shadow-[0_0_0_4px_rgba(201,123,107,0.25)]"
                      : "border-deep/15 group-hover:border-accent/50",
                  )}
                >
                  <span
                    className="absolute inset-1 rounded-full"
                    style={{ backgroundColor: color.colorHex ?? "#d4d4d4" }}
                  />
                  {isActive ? (
                    <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "max-w-[4.5rem] truncate text-[10px] font-medium uppercase tracking-wide sm:text-[11px]",
                    isActive ? "text-deep" : "text-muted",
                  )}
                >
                  {color.colorName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
