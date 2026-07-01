import type { Product } from "@/types/product";
import type { PhoneModel } from "@/types/phone-model";

/** Model IDs that have at least one visible product in the catalog. */
export function deriveShopModelIdSet(products: Product[]): Set<string> {
  const modelIds = new Set<string>();

  for (const product of products) {
    for (const modelId of product.availableModelIds ?? []) {
      modelIds.add(modelId);
    }
  }

  return modelIds;
}

export function deriveShopModelIds(products: Product[], phoneModels: PhoneModel[]): string[] {
  const catalogIds = deriveShopModelIdSet(products);

  return phoneModels
    .filter((model) => catalogIds.has(model.id))
    .map((model) => model.id);
}

export function deriveShopThemes(products: Product[]): string[] {
  const themes = new Set<string>();

  for (const product of products) {
    if (product.theme?.trim()) {
      themes.add(product.theme.trim());
    }
  }

  return Array.from(themes).sort((a, b) => a.localeCompare(b));
}
