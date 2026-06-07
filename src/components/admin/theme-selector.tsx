"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useProductThemes } from "@/hooks/use-admin-catalog";

const NEW_THEME_VALUE = "__new__";

type ThemeSelectorProps = {
  value: string;
  onChange: (theme: string) => void;
  disabled?: boolean;
};

export function ThemeSelector({ value, onChange, disabled }: ThemeSelectorProps) {
  const { data: themes = [] } = useProductThemes();
  const isExisting = themes.some(
    (theme) => theme.toLowerCase() === value.trim().toLowerCase(),
  );
  const [mode, setMode] = useState<"existing" | "new">(
    value && !isExisting ? "new" : "existing",
  );

  useEffect(() => {
    if (value && !themes.some((theme) => theme.toLowerCase() === value.toLowerCase())) {
      setMode("new");
    }
  }, [value, themes]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="theme-mode">Design group / theme</Label>
        <select
          id="theme-mode"
          disabled={disabled}
          value={mode === "new" ? NEW_THEME_VALUE : value || themes[0] || NEW_THEME_VALUE}
          onChange={(event) => {
            const next = event.target.value;
            if (next === NEW_THEME_VALUE) {
              setMode("new");
              onChange("");
              return;
            }

            setMode("existing");
            onChange(next);
          }}
          className="h-10 w-full rounded-md border border-muted/30 bg-background px-3 text-sm"
        >
          {themes.map((theme) => (
            <option key={theme} value={theme}>
              {theme} (existing group)
            </option>
          ))}
          <option value={NEW_THEME_VALUE}>+ Create new theme</option>
        </select>
        <Text variant="small" as="p" className="text-muted">
          Cases in the same theme share a design family (e.g. Cosmic, Floral). Pick an existing
          group to add another case design, or create a new one.
        </Text>
      </div>

      {mode === "new" ? (
        <div className="space-y-2">
          <Label htmlFor="new-theme">New theme name</Label>
          <Input
            id="new-theme"
            placeholder="e.g. Cosmic, Minimal, Floral"
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
}
