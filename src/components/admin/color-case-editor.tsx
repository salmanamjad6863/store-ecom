"use client";

import { ImageUploader } from "@/components/admin/image-uploader";
import { ModelMultiSelect } from "@/components/admin/model-multi-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { usePhoneModels } from "@/hooks/use-phone-models";
import { getVariantsForColor } from "@/lib/utils/product-colors";
import type { ProductWithVariants } from "@/types/product";
import type { PhoneModel } from "@/types/phone-model";

export type ColorCaseEntry = {
  /** Stable id stored on the design product's colors array. */
  colorDocId?: string;
  colorName: string;
  colorHex: string;
  themeLine: string;
  images: string[];
  selectedModelIds: string[];
  modelQuantities: Record<string, number>;
  variantIds?: Record<string, string>;
};

type ColorCaseEditorProps = {
  entry: ColorCaseEntry;
  index: number;
  onChange: (entry: ColorCaseEntry) => void;
  caseCounts?: Record<string, number>;
};

export function createEmptyColorCaseEntry(): ColorCaseEntry {
  return {
    colorName: "",
    colorHex: "#1a1a1a",
    themeLine: "",
    images: [],
    selectedModelIds: [],
    modelQuantities: {},
  };
}

export function colorEntriesFromProduct(product: ProductWithVariants): ColorCaseEntry[] {
  return product.colors.map((color) => {
    const colorVariants = getVariantsForColor(product.variants, color.colorId);
    const variantIds = Object.fromEntries(
      colorVariants.map((variant) => [variant.modelId, variant.id]),
    );

    return {
      colorDocId: color.id,
      colorName: color.colorName,
      colorHex: color.colorHex ?? "#1a1a1a",
      themeLine: color.themeLine ?? "",
      images: color.images.length > 0 ? color.images.slice(0, 1) : [],
      selectedModelIds: colorVariants.map((variant) => variant.modelId),
      modelQuantities: Object.fromEntries(
        colorVariants.map((variant) => [variant.modelId, variant.quantity]),
      ),
      variantIds,
    };
  });
}

export function syncColorCaseModels(
  entry: ColorCaseEntry,
  selectedModelIds: string[],
  _phoneModels: PhoneModel[],
): ColorCaseEntry {
  const modelQuantities = { ...entry.modelQuantities };

  for (const modelId of selectedModelIds) {
    if (modelQuantities[modelId] === undefined) {
      modelQuantities[modelId] = 0;
    }
  }

  for (const modelId of Object.keys(modelQuantities)) {
    if (!selectedModelIds.includes(modelId)) {
      delete modelQuantities[modelId];
    }
  }

  return {
    ...entry,
    selectedModelIds,
    modelQuantities,
  };
}

export function ColorCaseEditor({ entry, index, onChange, caseCounts }: ColorCaseEditorProps) {
  const { data: phoneModels = [] } = usePhoneModels(false);

  const selectedModels = phoneModels.filter(
    (model) => model.active && entry.selectedModelIds.includes(model.id),
  );

  const patch = (partial: Partial<ColorCaseEntry>) => onChange({ ...entry, ...partial });

  const handleModelsChange = (selectedModelIds: string[]) => {
    onChange(syncColorCaseModels(entry, selectedModelIds, phoneModels));
  };

  const totalStock = entry.selectedModelIds.reduce(
    (sum, modelId) => sum + (entry.modelQuantities[modelId] ?? 0),
    0,
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`color-name-${index}`}>Color name</Label>
          <Input
            id={`color-name-${index}`}
            placeholder="Ocean Blue"
            value={entry.colorName}
            onChange={(event) => patch({ colorName: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`color-hex-${index}`}>Theme color swatch</Label>
          <div className="flex items-center gap-3">
            <Input
              id={`color-hex-${index}`}
              type="color"
              value={entry.colorHex}
              onChange={(event) => patch({ colorHex: event.target.value })}
              className="h-10 w-20 cursor-pointer p-1"
            />
            <span
              className="h-10 w-10 rounded-full border border-muted/30"
              style={{ backgroundColor: entry.colorHex }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`theme-line-${index}`}>Theme line</Label>
        <Input
          id={`theme-line-${index}`}
          placeholder="Deep ocean tones with a subtle wave shimmer"
          value={entry.themeLine}
          onChange={(event) => patch({ themeLine: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Case photo</Label>
        <ImageUploader
          images={entry.images}
          maxImages={1}
          onChange={(images) => patch({ images })}
        />
      </div>

      <div className="space-y-3 border-t border-muted/20 pt-5">
        <Label>iPhone models & quantity</Label>
        <ModelMultiSelect
          models={phoneModels}
          selectedIds={entry.selectedModelIds}
          onChange={handleModelsChange}
          caseCounts={caseCounts}
        />
      </div>

      {selectedModels.length > 0 ? (
        <div className="space-y-3 rounded-lg border border-accent/20 bg-accent/5 p-4">
          <Text variant="small" as="p" className="font-medium text-deep">
            Stock per model · total: {totalStock}
          </Text>
          <div className="grid gap-3 sm:grid-cols-2">
            {selectedModels.map((model) => (
              <div key={model.id} className="space-y-1.5">
                <Label htmlFor={`qty-${index}-${model.id}`}>{model.name}</Label>
                <Input
                  id={`qty-${index}-${model.id}`}
                  type="number"
                  min={0}
                  value={entry.modelQuantities[model.id] ?? 0}
                  onChange={(event) =>
                    patch({
                      modelQuantities: {
                        ...entry.modelQuantities,
                        [model.id]: Number(event.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
