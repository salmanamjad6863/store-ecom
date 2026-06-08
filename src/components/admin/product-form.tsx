"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  ColorCaseEditor,
  colorEntriesFromProduct,
  createEmptyColorCaseEntry,
  type ColorCaseEntry,
} from "@/components/admin/color-case-editor";
import { ColorCaseTabs } from "@/components/admin/color-case-tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { useCasesPerModel } from "@/hooks/use-admin-catalog";
import { usePhoneModels } from "@/hooks/use-phone-models";
import {
  colorIdFromEntry,
  designToProductInput,
  type DesignSubmitValues,
  validateColorCaseEntry,
  validateDesignSale,
  type DesignFormValues,
} from "@/lib/admin/design-product";
import type { ProductInput } from "@/lib/queries/products";
import { formatCurrency } from "@/lib/utils/format";
import { env } from "@/lib/env";
import type { ProductWithVariants } from "@/types/product";
import { PRODUCT_TAG_OPTIONS, type ProductTagOption } from "@/types/product-tag";

const designFormSchema = z.object({
  theme: z.string().min(1, "Design name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.string().min(1, "Category is required"),
  priceDollars: z.number().positive("Original price must be greater than 0"),
  salePriceDollars: z.number().positive().optional(),
  onSale: z.boolean(),
  hidden: z.boolean(),
  useVariants: z.boolean(),
  tag: z.enum(["none", "new", "hot"]),
});

type ProductFormProps = {
  product?: ProductWithVariants;
  onSubmit: (input: ProductInput) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
};

function fromMinorUnits(minor: number): number {
  return minor / 100;
}

export function ProductForm({
  product,
  onSubmit,
  submitLabel = "Save design",
  isSubmitting = false,
}: ProductFormProps) {
  const initialEntries = product
    ? colorEntriesFromProduct(product)
    : [createEmptyColorCaseEntry()];

  const [colorEntries, setColorEntries] = useState<ColorCaseEntry[]>(initialEntries);
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [shopFeaturedColorIndex, setShopFeaturedColorIndex] = useState(() => {
    if (!product?.shopFeaturedColorId) {
      return 0;
    }
    const index = initialEntries.findIndex(
      (entry) => colorIdFromEntry(entry) === product.shopFeaturedColorId,
    );
    return index >= 0 ? index : 0;
  });
  const [formError, setFormError] = useState<string | null>(null);

  const { data: phoneModels = [] } = usePhoneModels(false);
  const { data: caseCounts = {} } = useCasesPerModel();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(designFormSchema),
    defaultValues: {
      theme: product?.theme ?? "",
      description: product?.description ?? "",
      type: product?.type ?? "iPhone Cases",
      priceDollars: product ? fromMinorUnits(product.price) : 2499,
      salePriceDollars:
        product?.onSale && product.salePrice !== undefined
          ? fromMinorUnits(product.salePrice)
          : undefined,
      onSale: product?.onSale ?? false,
      hidden: product?.hidden ?? false,
      useVariants: product?.hasVariants ?? true,
      tag: (product?.tag ?? "none") as ProductTagOption,
    },
  });

  const theme = watch("theme");
  const description = watch("description");
  const onSale = watch("onSale");
  const priceDollars = watch("priceDollars");
  const salePriceDollars = watch("salePriceDollars");
  const useVariants = watch("useVariants");

  const previewColor = colorEntries[activeColorIndex] ?? colorEntries[0];
  const activeEntry = colorEntries[activeColorIndex];

  const shopFeaturedOptions = useMemo(
    () =>
      colorEntries.map((entry, index) => ({
        index,
        label: entry.colorName.trim() || `Color ${index + 1}`,
        colorId: colorIdFromEntry(entry),
        hasImage: entry.images.length > 0,
      })),
    [colorEntries],
  );

  const previewModels = useMemo(() => {
    if (!previewColor || !useVariants) {
      return [];
    }
    return previewColor.selectedModelIds
      .map((modelId) => {
        const model = phoneModels.find((entry) => entry.id === modelId);
        const qty = previewColor.modelQuantities[modelId] ?? 0;
        if (!model) {
          return null;
        }
        return { name: model.name, qty };
      })
      .filter((entry): entry is { name: string; qty: number } => entry !== null);
  }, [previewColor, phoneModels, useVariants]);

  const updateColorEntry = (index: number, entry: ColorCaseEntry) => {
    setColorEntries((current) => current.map((item, i) => (i === index ? entry : item)));
  };

  const addColorEntry = () => {
    setColorEntries((current) => {
      const next = [...current, createEmptyColorCaseEntry()];
      setActiveColorIndex(next.length - 1);
      return next;
    });
  };

  const removeColorEntry = (index: number) => {
    setColorEntries((current) => {
      const next = current.filter((_, i) => i !== index);
      setActiveColorIndex((prev) => {
        if (prev > index) {
          return prev - 1;
        }
        return Math.min(prev, Math.max(0, next.length - 1));
      });
      setShopFeaturedColorIndex((prev) => {
        if (prev === index) {
          return 0;
        }
        if (prev > index) {
          return prev - 1;
        }
        return prev;
      });
      return next;
    });
  };

  const handleFormSubmit = async (values: DesignFormValues) => {
    setFormError(null);

    const saleError = validateDesignSale(values);
    if (saleError) {
      setFormError(saleError);
      return;
    }

    if (colorEntries.length === 0) {
      setFormError("Add at least one color case.");
      return;
    }

    for (let index = 0; index < colorEntries.length; index += 1) {
      const error = validateColorCaseEntry(colorEntries[index], index, values.useVariants);
      if (error) {
        setFormError(error);
        return;
      }
    }

    const featuredOption = shopFeaturedOptions[shopFeaturedColorIndex] ?? shopFeaturedOptions[0];
    const shopFeaturedColorId = featuredOption?.colorId ?? colorIdFromEntry(colorEntries[0]);

    const designValues: DesignSubmitValues = {
      ...values,
      shopFeaturedColorId,
    };

    try {
      await onSubmit(designToProductInput(designValues, colorEntries, phoneModels));
    } catch (error) {
      console.error("Product save failed:", error);

      const message =
        error instanceof Error ? error.message : "Could not save. Please try again.";

      if (/permission|insufficient/i.test(message)) {
        setFormError(
          "Permission denied. Sign in as an admin and ensure Firestore rules allow writes to products and variants.",
        );
        return;
      }

      if (/undefined/i.test(message)) {
        setFormError("Could not save — invalid product data. Please try again.");
        return;
      }

      setFormError(message || "Could not save. Please try again.");
    }
  };

  return (
    <Card className="max-w-4xl space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <section className="rounded-xl border border-accent/25 bg-accent/5 p-5 sm:p-6">
          <Text variant="small" as="p" className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
            Storefront preview
          </Text>
          <Text variant="h2" as="h2" className="mt-2 font-serif text-2xl text-deep">
            {theme || "Design name"}
          </Text>
          {previewColor?.themeLine ? (
            <Text variant="body" as="p" className="mt-1 italic text-warm">
              {previewColor.themeLine}
            </Text>
          ) : null}
          {previewColor?.colorName ? (
            <div className="mt-4 flex items-center gap-2">
              <span
                className="h-5 w-5 rounded-full border border-deep/15"
                style={{ backgroundColor: previewColor.colorHex }}
              />
              <Text variant="small" as="span" className="font-medium text-deep">
                {previewColor.colorName}
              </Text>
            </div>
          ) : null}
          {description ? (
            <Text variant="small" as="p" className="mt-3 line-clamp-3 text-muted">
              {description}
            </Text>
          ) : null}
          {previewModels.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {previewModels.map((model) => (
                <span
                  key={model.name}
                  className="rounded-full border border-deep/10 bg-white px-3 py-1 text-xs text-deep/80"
                >
                  {model.name} · {model.qty} in stock
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <Text variant="h2" as="h2" className="text-lg">
            Design
          </Text>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="theme">Product design name</Label>
              <Input id="theme" placeholder="Cosmic Wave" {...register("theme")} />
              {errors.theme ? (
                <Text variant="small" as="p" className="text-danger">
                  {errors.theme.message}
                </Text>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...register("description")} />
              {errors.description ? (
                <Text variant="small" as="p" className="text-danger">
                  {errors.description.message}
                </Text>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Shop category</Label>
              <Input id="type" {...register("type")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceDollars">Original price (PKR)</Label>
              <Input
                id="priceDollars"
                type="number"
                step="1"
                {...register("priceDollars", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="rounded-lg border border-muted/20 bg-background p-4 space-y-4">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-accent"
                {...register("useVariants")}
              />
              <span>
                <span className="font-medium">Stock per iPhone model</span>
                <Text variant="small" as="span" className="mt-0.5 block text-muted">
                  Turn on for phone cases — each model (iPhone 15, 16, 17…) gets its own quantity.
                  Turn off only for simple products like t-shirts with one total stock count.
                </Text>
              </span>
            </label>
          </div>

          <div className="rounded-lg border border-muted/20 bg-background p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="h-4 w-4 accent-accent" {...register("onSale")} />
              On sale
            </label>
            {onSale ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priceDollars-readonly">Original price</Label>
                  <Input
                    id="priceDollars-readonly"
                    type="number"
                    value={priceDollars ?? ""}
                    readOnly
                    className="bg-soft text-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePriceDollars">Sale price (PKR)</Label>
                  <Input
                    id="salePriceDollars"
                    type="number"
                    step="1"
                    placeholder="1999"
                    {...register("salePriceDollars", { valueAsNumber: true })}
                  />
                </div>
                {typeof salePriceDollars === "number" &&
                typeof priceDollars === "number" &&
                salePriceDollars > 0 &&
                salePriceDollars < priceDollars ? (
                  <Text variant="small" as="p" className="sm:col-span-2 text-muted">
                    Customer pays{" "}
                    {formatCurrency(
                      Math.round(salePriceDollars * 100),
                      env.currency.code,
                      env.currency.locale,
                    )}{" "}
                    instead of{" "}
                    {formatCurrency(
                      Math.round(priceDollars * 100),
                      env.currency.code,
                      env.currency.locale,
                    )}
                  </Text>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag">Storefront tag</Label>
            <select
              id="tag"
              {...register("tag")}
              className="h-10 w-full max-w-md rounded-md border border-muted/30 bg-background px-3 text-sm"
            >
              {PRODUCT_TAG_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Text variant="small" as="p" className="text-muted">
              Optional badge on shop and home cards. Choose None to hide the tag.
            </Text>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-accent" {...register("hidden")} />
            Hidden from shop
          </label>
        </section>

        <section className="space-y-4 border-t border-muted/20 pt-6">
          <div>
            <Text variant="h2" as="h2" className="text-lg">
              Color cases
            </Text>
            <Text variant="small" as="p" className="mt-1 text-muted">
              Switch tabs to edit each color. If the shop color is sold out, another in-stock color
              shows automatically.
            </Text>
          </div>

          <ColorCaseTabs
            entries={colorEntries}
            activeIndex={activeColorIndex}
            onSelect={setActiveColorIndex}
            onAdd={addColorEntry}
            onRemove={removeColorEntry}
          />

          {shopFeaturedOptions.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="shopFeaturedColor">Shop & home page image</Label>
              <select
                id="shopFeaturedColor"
                value={shopFeaturedColorIndex}
                onChange={(event) => setShopFeaturedColorIndex(Number(event.target.value))}
                className="h-10 w-full max-w-md rounded-md border border-muted/30 bg-background px-3 text-sm"
              >
                {shopFeaturedOptions.map((option) => (
                  <option key={option.index} value={option.index}>
                    {option.label}
                    {!option.hasImage ? " (no photo yet)" : ""}
                  </option>
                ))}
              </select>
              <Text variant="small" as="p" className="text-muted">
                Which color&apos;s case photo appears on shop and home cards first.
              </Text>
            </div>
          ) : null}

          {activeEntry ? (
            <div className="rounded-xl border border-muted/25 bg-background p-4 sm:p-6">
              <ColorCaseEditor
                key={activeEntry.colorDocId ?? `edit-${activeColorIndex}`}
                entry={activeEntry}
                index={activeColorIndex}
                onChange={(next) => updateColorEntry(activeColorIndex, next)}
                caseCounts={caseCounts}
              />
            </div>
          ) : null}
        </section>

        {formError ? (
          <Text variant="small" as="p" className="text-danger">
            {formError}
          </Text>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </form>
    </Card>
  );
}
