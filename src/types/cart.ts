export type CartItem = {
  productId: string;
  colorId: string;
  variantId: string;
  slug: string;
  name: string;
  modelName?: string;
  colorName?: string;
  image: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
};

export type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  replaceItems: (items: CartItem[]) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
};

/** Unique key for a cart line (design + color + model). */
export function getCartLineKey(productId: string, colorId: string, variantId: string): string {
  if (variantId) {
    return `${productId}:${colorId}:${variantId}`;
  }
  if (colorId) {
    return `${productId}:${colorId}`;
  }
  return productId;
}
