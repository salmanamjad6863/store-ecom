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
import { formatCurrency } from "@/lib/utils/format";
import { getProductDisplayPrice } from "@/lib/utils/product";
import { resolveListingDisplayColor } from "@/lib/utils/product-colors";
import { FEATURED_HERO_PRODUCT_COUNT } from "@/types/store-settings";
import type { Product } from "@/types/product";

function getProductImage(product: Product): string {
  const color = resolveListingDisplayColor(product);
  return color.heroImage ?? color.images[0] ?? product.heroImage ?? product.images[0] ?? "";
}

function emptySlots(): string[] {
  return Array.from({ length: FEATURED_HERO_PRODUCT_COUNT }, () => "");
}

export function FeaturedProductsManager() {
  const { data: products, isLoading: productsLoading, isError: productsError } = useAdminProducts();
  const { data: settings, isLoading: settingsLoading } = useHomepageSettings();
  const { saveFeaturedMutation } = useHomepageSettingsMutations();

  const [slots, setSlots] = useState<string[]>(emptySlots);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!settings) {
      return;
    }

    const next = emptySlots();
    settings.featuredProductIds.forEach((id, index) => {
      next[index] = id;
    });
    setSlots(next);
  }, [settings]);

  const productById = useMemo(
    () => new Map((products ?? []).map((product) => [product.id, product])),
    [products],
  );

  const updateSlot = (index: number, productId: string) => {
    setSaved(false);
    setFormError(null);
    setSlots((current) => {
      const next = [...current];
      next[index] = productId;
      return next;
    });
  };

  const handleSave = async () => {
    setFormError(null);
    setSaved(false);

    const hiddenSelected = slots.filter((id) => id && productById.get(id)?.hidden);

    if (hiddenSelected.length > 0) {
      setFormError("Hidden products will not appear on the home page. Unhide them or pick visible products.");
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
          Choose up to 3 products for the hero section on the home page. The same product can fill
          multiple slots. Leave a slot empty to show fewer cards.
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
            {slots.map((selectedId, index) => {
              const product = selectedId ? productById.get(selectedId) : undefined;
              const image = product ? getProductImage(product) : "";
              const { amount } = product ? getProductDisplayPrice(product) : { amount: 0 };

              return (
                <Card key={index} className="space-y-4">
                  <Text variant="small" as="p" className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
                    Slot {index + 1}
                  </Text>

                  <div className="relative mx-auto aspect-[9/16] w-full max-w-[140px] overflow-hidden rounded-xl border border-muted/20 bg-soft">
                    {image ? (
                      <Image src={image} alt="" fill sizes="140px" className="object-cover" />
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
                      <Text variant="small" as="p" className="text-muted">
                        {formatCurrency(amount, env.currency.code, env.currency.locale)}
                      </Text>
                      {product.hidden ? (
                        <Text variant="small" as="p" className="mt-1 text-danger">
                          Hidden from shop
                        </Text>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor={`featured-slot-${index}`}>
                      Product
                    </label>
                    <select
                      id={`featured-slot-${index}`}
                      value={selectedId}
                      onChange={(event) => updateSlot(index, event.target.value)}
                      className="h-10 w-full rounded-md border border-muted/30 bg-background px-3 text-sm"
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
                </Card>
              );
            })}
          </div>

          <Card className="space-y-3 bg-soft/50">
            <Text variant="h2" as="h2" className="text-base">
              Hero preview order
            </Text>
            <Text variant="muted" as="p" className="text-sm">
              {slots.filter(Boolean).length > 0
                ? slots
                    .filter(Boolean)
                    .map((id, index) => {
                      const product = productById.get(id);
                      return `${index + 1}. ${product?.theme || product?.name || "Unknown"}`;
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
