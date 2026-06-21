import type { Product } from "@/types/product";

type CatalogFilterOptions = {
  type?: string;
  modelId?: string;
  theme?: string;
};

/** Client-side catalog filter — mirrors server / Firestore list filtering. */
export function filterCatalogProducts(
  products: Product[],
  { type, modelId, theme }: CatalogFilterOptions,
): Product[] {
  let filtered = products;

  if (type) {
    filtered = filtered.filter((product) => product.type === type);
  }

  if (theme) {
    filtered = filtered.filter(
      (product) => product.theme.toLowerCase() === theme.toLowerCase(),
    );
  }

  if (modelId) {
    filtered = filtered.filter(
      (product) =>
        !product.hasVariants || (product.availableModelIds ?? []).includes(modelId),
    );
  }

  return [...filtered].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
