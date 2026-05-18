export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (type?: string) => ["products", "list", type ?? "all"] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
    types: ["products", "types"] as const,
    adminList: ["products", "admin", "list"] as const,
    adminDetail: (id: string) => ["products", "admin", "detail", id] as const,
  },
  orders: {
    all: ["orders"] as const,
    byNumber: (orderNumber: string) => ["orders", "number", orderNumber] as const,
    byUser: (userId: string) => ["orders", "user", userId] as const,
    adminList: ["orders", "admin", "list"] as const,
    adminDetail: (id: string) => ["orders", "admin", "detail", id] as const,
  },
} as const;
