import type { ProductColor, ProductColorDocument } from "@/types/product-color";
import type { ProductTag } from "@/types/product-tag";

/** One design product — all colors and shared pricing live on this document. */
export type Product = {
  id: string;
  /** Design name shown on storefront. */
  name: string;
  slug: string;
  theme: string;
  type: string;
  description: string;
  images: string[];
  price: number;
  salePrice?: number;
  salePercent?: number;
  onSale: boolean;
  /** Manual card tag: "new", "hot", or unset for none. */
  tag?: ProductTag | null;
  /** Total stock across all colors (denormalized). */
  quantity: number;
  hidden: boolean;
  colors: ProductColor[];
  shopFeaturedColorId?: string;
  hasVariants?: boolean;
  defaultVariantId?: string;
  availableModelIds?: string[];
  heroImage?: string;
  totalQuantity?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductDocument = Omit<Product, "id" | "createdAt" | "updatedAt" | "colors"> & {
  colors?: ProductColorDocument[];
  createdAt: unknown;
  updatedAt: unknown;
};

export type ProductWithVariants = Product & {
  variants: import("@/types/product-variant").ProductVariant[];
};

export type { ProductColor, ProductColorDocument };
export type { ProductTag, ProductTagOption } from "@/types/product-tag";
