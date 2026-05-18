export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (type?: string) => ["products", "list", type ?? "all"] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
    types: ["products", "types"] as const,
  },
  orders: {
    byNumber: (orderNumber: string) => ["orders", "number", orderNumber] as const,
    byUser: (userId: string) => ["orders", "user", userId] as const,
  },
} as const;
