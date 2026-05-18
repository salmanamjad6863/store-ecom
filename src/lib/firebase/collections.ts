export const COLLECTIONS = {
  products: "products",
  orders: "orders",
  users: "users",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
