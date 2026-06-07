/** One color option within a design product. */
export type ProductColor = {
  id: string;
  colorId: string;
  colorName: string;
  colorHex?: string;
  themeLine?: string;
  images: string[];
  heroImage?: string;
  availableModelIds?: string[];
  totalQuantity?: number;
};

export type ProductColorDocument = Omit<ProductColor, "id">;

export type ProductColorInput = {
  id?: string;
  colorId: string;
  colorName: string;
  colorHex?: string;
  themeLine?: string;
  images: string[];
};
