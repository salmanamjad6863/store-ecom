export type ProductVariant = {
  id: string;
  productId: string;
  colorId: string;
  modelId: string;
  modelName: string;
  images: string[];
  quantity: number;
  price?: number;
  sku?: string;
};

export type ProductVariantDocument = Omit<ProductVariant, "id" | "productId">;

export type VariantInput = {
  id?: string;
  colorId: string;
  modelId: string;
  modelName: string;
  images: string[];
  quantity: number;
  price?: number;
  sku?: string;
};

export type DesignColorOption = {
  colorId: string;
  colorName: string;
  colorHex?: string;
  heroImage?: string;
  inStock: boolean;
};
