export type Product = {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  images: string[];
  price: number;
  salePrice?: number;
  onSale: boolean;
  quantity: number;
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductDocument = Omit<Product, "id" | "createdAt" | "updatedAt"> & {
  createdAt: unknown;
  updatedAt: unknown;
};
