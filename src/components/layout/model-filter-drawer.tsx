"use client";

import { ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Text } from "@/components/ui/text";
import { useProducts } from "@/hooks/use-products";
import { usePhoneModels } from "@/hooks/use-phone-models";
import { deriveShopModelIdSet } from "@/lib/shop/catalog-derived";
import {
  getPhoneModelVariantLabel,
  groupPhoneModelsByGeneration,
} from "@/lib/utils/phone-model-groups";
import { useModelFilterDrawer } from "@/providers/model-filter-drawer-provider";
import { cn } from "@/lib/utils/cn";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/utils/scroll-lock";

const PANEL_ANIMATION_MS = 400;
const OPEN_DELAY_MS = 60;

function buildShopHref(modelId?: string, theme?: string | null): string {
  const params = new URLSearchParams();

  if (modelId) {
    params.set("model", modelId);
  }

  if (theme) {
    params.set("theme", theme);
  }

  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

export function ModelFilterDrawer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeModelId = searchParams.get("model");
  const activeTheme = searchParams.get("theme");
  const { isOpen, closeDrawer } = useModelFilterDrawer();
  const { data: phoneModels = [] } = usePhoneModels();
  const { data: catalogProducts = [] } = useProducts();
  const [present, setPresent] = useState(false);
  const [visible, setVisible] = useState(false);
  const [openGenerations, setOpenGenerations] = useState<Set<string>>(new Set());

  const shopModelIdSet = useMemo(
    () => deriveShopModelIdSet(catalogProducts),
    [catalogProducts],
  );

  const groups = useMemo(
    () => groupPhoneModelsByGeneration(phoneModels),
    [phoneModels],
  );

  useEffect(() => {
    if (isOpen) {
      setPresent(true);
      setVisible(false);
      setOpenGenerations(new Set());

      const openTimer = window.setTimeout(() => setVisible(true), OPEN_DELAY_MS);
      return () => window.clearTimeout(openTimer);
    }

    setVisible(false);
    const closeTimer = window.setTimeout(() => setPresent(false), PANEL_ANIMATION_MS + 40);
    return () => window.clearTimeout(closeTimer);
  }, [isOpen]);

  useEffect(() => {
    if (!present) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    lockBodyScroll();
    window.addEventListener("keydown", onKeyDown);

    return () => {
      unlockBodyScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [present, closeDrawer]);

  const toggleGeneration = (generation: string) => {
    setOpenGenerations((current) => {
      const next = new Set(current);
      if (next.has(generation)) {
        next.delete(generation);
      } else {
        next.add(generation);
      }
      return next;
    });
  };

  if (!present) {
    return null;
  }

  const preserveTheme = pathname === "/shop" ? activeTheme : null;

  return (
    <div className="fixed inset-0 z-[55]" role="presentation">
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-deep/45 backdrop-blur-[2px]",
          "transition-opacity duration-[340ms] ease-out",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-label="Close model filters"
        onClick={closeDrawer}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter by iPhone model"
        className={cn(
          "absolute inset-y-0 left-0 flex w-full max-w-[min(100vw,340px)] flex-col overflow-hidden bg-cream shadow-2xl will-change-transform",
          "transition-transform duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
          visible ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="shrink-0 border-b border-deep/8 px-5 pb-4 pt-5 sm:px-6">
          <button
            type="button"
            onClick={closeDrawer}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-deep/10 bg-white text-deep transition hover:bg-soft"
            aria-label="Close model filters"
          >
            <X className="h-4 w-4" />
          </button>

          <Text variant="h2" as="h2" className="font-serif text-2xl text-deep">
            iPhone models
          </Text>
          <Text variant="muted" as="p" className="mt-0.5 text-sm">
            Browse cases by your device
          </Text>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4">
          <Link
            href={buildShopHref(undefined, preserveTheme)}
            onClick={closeDrawer}
            className={cn(
              "mb-4 flex w-full items-center rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
              !activeModelId
                ? "border-accent bg-accent text-white"
                : "border-deep/10 bg-white text-deep hover:border-accent/30",
            )}
          >
            All models
          </Link>

          {groups.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted">
              No iPhone models added yet.
            </p>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => {
                const isExpanded = openGenerations.has(group.generation);
                const hasActiveChild = group.models.some((model) => model.id === activeModelId);
                const groupHasCases = group.models.some((model) => shopModelIdSet.has(model.id));

                return (
                  <div
                    key={group.generation}
                    className="overflow-hidden rounded-xl border border-deep/8 bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => toggleGeneration(group.generation)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
                        hasActiveChild ? "bg-accent/5" : "hover:bg-soft/60",
                      )}
                      aria-expanded={isExpanded}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="font-serif text-base font-semibold text-deep">
                          {group.label}
                        </span>
                        {!groupHasCases ? (
                          <span className="shrink-0 text-[9px] font-medium uppercase tracking-[0.14em] text-warm">
                            Coming soon
                          </span>
                        ) : null}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-warm transition-transform duration-300",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </button>

                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-300 ease-out",
                        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="overflow-hidden">
                        <ul className="space-y-0.5 border-t border-deep/6 px-2 py-2">
                          {group.models.map((model) => {
                            const isActive = activeModelId === model.id;
                            const hasCases = shopModelIdSet.has(model.id);
                            const label = getPhoneModelVariantLabel(model, group.generation);

                            return (
                              <li key={model.id}>
                                {hasCases ? (
                                  <Link
                                    href={buildShopHref(model.id, preserveTheme)}
                                    onClick={closeDrawer}
                                    className={cn(
                                      "block rounded-lg px-3 py-2.5 text-sm transition-colors",
                                      isActive
                                        ? "bg-accent font-medium text-white"
                                        : "text-deep/80 hover:bg-soft hover:text-deep",
                                    )}
                                  >
                                    {label}
                                  </Link>
                                ) : (
                                  <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm text-deep/45">
                                    <span>{label}</span>
                                    <span className="shrink-0 text-[9px] font-medium uppercase tracking-[0.14em] text-warm">
                                      Coming soon
                                    </span>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
