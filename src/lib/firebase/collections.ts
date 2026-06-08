export const COLLECTIONS = {
  products: "products",
  phoneModels: "phoneModels",
  orders: "orders",
  users: "users",
  storeSettings: "storeSettings",
} as const;

export const SUBCOLLECTIONS = {
  variants: "variants",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
