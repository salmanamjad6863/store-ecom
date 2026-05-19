"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  max: number;
  min?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
};

export function QuantitySelector({
  value,
  onChange,
  max,
  min = 1,
  disabled = false,
  label = "Quantity",
  className,
}: QuantitySelectorProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  const decrease = () => {
    if (!atMin) {
      onChange(value - 1);
    }
  };

  const increase = () => {
    if (!atMax) {
      onChange(value + 1);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-label="Decrease quantity"
          disabled={disabled || atMin}
          onClick={decrease}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span
          className="min-w-10 text-center text-base font-medium tabular-nums"
          aria-live="polite"
        >
          {value}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-label="Increase quantity"
          disabled={disabled || atMax}
          onClick={increase}
        >
          <Plus className="h-4 w-4" />
        </Button>
        {!disabled && max > 0 ? (
          <span className="text-sm text-muted">of {max} available</span>
        ) : null}
      </div>
    </div>
  );
}
