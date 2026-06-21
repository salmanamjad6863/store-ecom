import { slugify } from "@/lib/utils/slug";
import type { ProductInput } from "@/lib/queries/products";
import { createColorId } from "@/lib/queries/mappers";
import type { VariantInput } from "@/types/product-variant";

import type { ColorCaseEntry } from "@/components/admin/color-case-editor";

export type DesignFormValues = {
  theme: string;
  description: string;
  type: string;
  priceDollars: number;
  salePriceDollars?: number;
  onSale: boolean;
  hidden: boolean;
  useVariants: boolean;
  tag: import("@/types/product-tag").ProductTagOption;
};

export type DesignSubmitValues = DesignFormValues & {
  shopFeaturedColorId: string;
};

export function designToProductInput(
  design: DesignSubmitValues,
  colorEntries: ColorCaseEntry[],
  phoneModels: Array<{ id: string; name: string }>,
): ProductInput {
  const theme = design.theme.trim();
  const slug = slugify(theme);
  if (!slug) {
    throw new Error("Design name must include at least one letter or number.");
  }
  const priceMinor = Math.round(design.priceDollars * 100);
  const salePriceMinor =
    design.onSale && design.salePriceDollars !== undefined
      ? Math.round(design.salePriceDollars * 100)
      : undefined;

  const salePercent =
    design.onSale &&
    salePriceMinor !== undefined &&
    priceMinor > 0 &&
    salePriceMinor < priceMinor
      ? Math.round(((priceMinor - salePriceMinor) / priceMinor) * 100)
      : undefined;

  const colors = colorEntries.map((entry) => ({
    id: entry.colorDocId ?? createColorId(),
    colorId: slugify(entry.colorName),
    colorName: entry.colorName.trim(),
    colorHex: entry.colorHex,
    themeLine: entry.themeLine.trim() || undefined,
    images: entry.images.slice(0, 1),
  }));

  const variants: VariantInput[] = design.useVariants
    ? colorEntries.flatMap((entry) => {
        const colorId = slugify(entry.colorName);
        return entry.selectedModelIds.map((modelId) => {
          const model = phoneModels.find((item) => item.id === modelId);
          return {
            id: entry.variantIds?.[modelId],
            colorId,
            modelId,
            modelName: model?.name ?? modelId,
            images: entry.images.slice(0, 1),
            quantity: entry.modelQuantities[modelId] ?? 0,
          };
        });
      })
    : [];

  const featuredEntry =
    colorEntries.find((entry) => slugify(entry.colorName) === design.shopFeaturedColorId) ??
    colorEntries[0];

  const defaultColorId = featuredEntry ? slugify(featuredEntry.colorName) : colors[0]?.colorId;
  const defaultModelId =
    featuredEntry?.selectedModelIds.find(
      (modelId) => (featuredEntry.modelQuantities[modelId] ?? 0) > 0,
    ) ?? featuredEntry?.selectedModelIds[0];

  return {
    name: theme,
    slug,
    theme,
    type: design.type.trim(),
    description: design.description.trim(),
    price: priceMinor,
    salePrice: salePriceMinor,
    salePercent,
    onSale: design.onSale,
    hidden: design.hidden,
    tag: design.tag === "none" ? null : design.tag,
    shopFeaturedColorId: design.shopFeaturedColorId || defaultColorId,
    colors,
    variants,
    defaultModelId,
    defaultColorId,
    images: (featuredEntry?.images ?? colors[0]?.images ?? []).slice(0, 1),
  };
}

export function validateColorCaseEntry(
  entry: ColorCaseEntry,
  index: number,
  useVariants: boolean,
): string | null {
  if (!entry.colorName.trim()) {
    return `Color ${index + 1}: enter a color name.`;
  }
  if (entry.images.length === 0) {
    return `Color ${index + 1} (${entry.colorName}): upload a case photo.`;
  }
  if (!useVariants) {
    return null;
  }
  if (entry.selectedModelIds.length === 0) {
    return `Color ${index + 1} (${entry.colorName}): select at least one iPhone model.`;
  }
  const hasStock = entry.selectedModelIds.some(
    (modelId) => (entry.modelQuantities[modelId] ?? 0) > 0,
  );
  if (!hasStock) {
    return `Color ${index + 1} (${entry.colorName}): set quantity for at least one model.`;
  }
  return null;
}

export function validateDesignSale(values: DesignFormValues): string | null {
  if (!values.onSale) {
    return null;
  }
  if (values.salePriceDollars === undefined || Number.isNaN(values.salePriceDollars)) {
    return "Enter the sale price.";
  }
  if (values.salePriceDollars >= values.priceDollars) {
    return "Sale price must be lower than the original price.";
  }
  if (values.salePriceDollars <= 0) {
    return "Sale price must be greater than 0.";
  }
  return null;
}

export function colorIdFromEntry(entry: ColorCaseEntry): string {
  return slugify(entry.colorName.trim() || "color");
}
