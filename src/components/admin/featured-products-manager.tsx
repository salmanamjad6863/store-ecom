"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useAdminProducts } from "@/hooks/use-admin-products";
import { useHomepageSettings, useHomepageSettingsMutations } from "@/hooks/use-store-settings";
import { env } from "@/lib/env";
import {
  emptyFeaturedHeroSlots,
  getAvailableHeroColors,
  getDefaultHeroColorId,
  slotsFromHomepageSettings,
  type FeaturedHeroSlot,
} from "@/lib/featured/hero-items";
import { formatCurrency } from "@/lib/utils/format";
import { getProductDisplayPrice } from "@/lib/utils/product";
import { getColorById, resolveListingDisplayColor } from "@/lib/utils/product-colors";
import type { Product } from "@/types/product";

const selectClassName =
  "h-10 w-full rounded-md border border-muted/30 bg-background px-3 text-sm";

function getSlotImage(product: Product, colorId: string): string {
  const color = colorId
    ? getColorById(product, colorId) ?? resolveListingDisplayColor(product, colorId)
    : resolveListingDisplayColor(product);

  return color.heroImage ?? color.images[0] ?? product.heroImage ?? product.images[0] ?? "";
}

export function FeaturedProductsManager() {
  const { data: products, isLoading: productsLoading, isError: productsError } = useAdminProducts();
  const { data: settings, isLoading: settingsLoading } = useHomepageSettings();
  const { saveFeaturedMutation } = useHomepageSettingsMutations();

  const [slots, setSlots] = useState<FeaturedHeroSlot[]>(emptyFeaturedHeroSlots);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!settings) {
      return;
    }

    setSlots(slotsFromHomepageSettings(settings));
  }, [settings]);

  const productById = useMemo(
    () => new Map((products ?? []).map((product) => [product.id, product])),
    [products],
  );

  const updateSlotProduct = (index: number, productId: string) => {
    setSaved(false);
    setFormError(null);

    const product = productId ? productById.get(productId) : undefined;
    const colorId = product ? getDefaultHeroColorId(product) : "";

    setSlots((current) => {
      const next = [...current];
      next[index] = { productId, colorId };
      return next;
    });
  };

  const updateSlotColor = (index: number, colorId: string) => {
    setSaved(false);
    setFormError(null);
    setSlots((current) => {
      const next = [...current];
      next[index] = { ...next[index], colorId };
      return next;
    });
  };

  const handleSave = async () => {
    setFormError(null);
    setSaved(false);

    const hiddenSelected = slots.filter(
      (slot) => slot.productId && productById.get(slot.productId)?.hidden,
    );

    if (hiddenSelected.length > 0) {
      setFormError("Hidden products will not appear on the home page. Unhide them or pick visible products.");
      return;
    }

    const invalidColor = slots.find((slot) => {
      if (!slot.productId) {
        return false;
      }

      const product = productById.get(slot.productId);
      if (!product) {
        return false;
      }

      const available = getAvailableHeroColors(product);
      return available.length > 0 && !available.some((color) => color.colorId === slot.colorId);
    });

    if (invalidColor) {
      setFormError("Pick an available color for each featured product.");
      return;
    }

    try {
      await saveFeaturedMutation.mutateAsync(slots);
      setSaved(true);
    } catch (error) {
      console.error("Failed to save featured products:", error);
      setFormError(
        error instanceof Error ? error.message : "Could not save featured products. Please try again.",
      );
    }
  };

  const isLoading = productsLoading || settingsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (productsError) {
    return (
      <EmptyState
        title="Could not load products"
        description="Check your Firebase connection and try again."
      />
    );
  }

  const availableProducts = products ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Text variant="h1" as="h1">
          Home featured products
        </Text>
        <Text variant="muted" as="p" className="mt-2">
          Choose up to 3 products for the hero section on the home page. Pick the color variant to
          show for each design. Only in-stock colors are listed.
        </Text>
      </div>

      {availableProducts.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add products first, then select them for the home hero."
          action={<Button href="/admin/products/new">Add product</Button>}
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            {slots.map((slot, index) => {
              const product = slot.productId ? productById.get(slot.productId) : undefined;
              const availableColors = product ? getAvailableHeroColors(product) : [];
              const selectedColor = product
                ? getColorById(product, slot.colorId) ?? availableColors[0]
                : undefined;
              const image = product ? getSlotImage(product, slot.colorId) : "";
              const { amount } = product ? getProductDisplayPrice(product) : { amount: 0 };

              return (
                <Card key={index} className="space-y-4">
                  <Text variant="small" as="p" className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
                    Slot {index + 1}
                  </Text>

                  <div className="relative mx-auto aspect-[9/16] w-full max-w-[140px] overflow-hidden rounded-xl border border-muted/20 bg-soft">
                    {image ? (
                      <Image src={image} alt="" fill sizes="140px" className="object-contain p-2" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted">
                        No product
                      </div>
                    )}
                  </div>

                  {product ? (
                    <div className="text-center">
                      <Text variant="small" as="p" className="font-medium text-deep">
                        {product.theme || product.name}
                      </Text>
                      {selectedColor ? (
                        <Text variant="small" as="p" className="text-muted">
                          {selectedColor.colorName}
                        </Text>
                      ) : null}
                      <Text variant="small" as="p" className="text-muted">
                        {formatCurrency(amount, env.currency.code, env.currency.locale)}
                      </Text>
                      {product.hidden ? (
                        <Text variant="small" as="p" className="mt-1 text-danger">
                          Hidden from shop
                        </Text>
                      ) : null}
                      {availableColors.length === 0 ? (
                        <Text variant="small" as="p" className="mt-1 text-danger">
                          No colors in stock
                        </Text>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor={`featured-slot-${index}`}>
                        Design
                      </label>
                      <select
                        id={`featured-slot-${index}`}
                        value={slot.productId}
                        onChange={(event) => updateSlotProduct(index, event.target.value)}
                        className={selectClassName}
                      >
                        <option value="">None</option>
                        {availableProducts.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.theme || item.name}
                            {item.hidden ? " (hidden)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {product && availableColors.length > 0 ? (
                      <div className="space-y-2">
                        <label
                          className="text-sm font-medium text-foreground"
                          htmlFor={`featured-color-${index}`}
                        >
                          Color
                        </label>
                        <select
                          id={`featured-color-${index}`}
                          value={slot.colorId}
                          onChange={(event) => updateSlotColor(index, event.target.value)}
                          className={selectClassName}
                        >
                          {availableColors.map((color) => (
                            <option key={color.colorId} value={color.colorId}>
                              {color.colorName}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="space-y-3 bg-soft/50">
            <Text variant="h2" as="h2" className="text-base">
              Hero preview order
            </Text>
            <Text variant="muted" as="p" className="text-sm">
              {slots.filter((slot) => slot.productId).length > 0
                ? slots
                    .filter((slot) => slot.productId)
                    .map((slot, index) => {
                      const product = productById.get(slot.productId);
                      const color = product ? getColorById(product, slot.colorId) : undefined;
                      const label = product?.theme || product?.name || "Unknown";
                      return `${index + 1}. ${label}${color ? ` (${color.colorName})` : ""}`;
                    })
                    .join(" · ")
                : "No featured products selected — the home page will show your 3 newest visible products."}
            </Text>
          </Card>

          {formError ? (
            <Text variant="small" as="p" className="text-danger">
              {formError}
            </Text>
          ) : null}

          {saved ? (
            <Text variant="small" as="p" className="text-accent">
              Featured products saved.
            </Text>
          ) : null}

          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={saveFeaturedMutation.isPending}
          >
            {saveFeaturedMutation.isPending ? "Saving…" : "Save featured products"}
          </Button>
        </>
      )}
    </div>
  );
}
