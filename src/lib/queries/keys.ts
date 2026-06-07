export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (filters?: { type?: string; modelId?: string; theme?: string }) =>
      ["products", "list", filters?.type ?? "all", filters?.modelId ?? "all", filters?.theme ?? "all"] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
    detailWithVariants: (slug: string) => ["products", "detail", slug, "variants"] as const,
    types: ["products", "types"] as const,
    themes: ["products", "themes"] as const,
    themeColors: (theme: string) => ["products", "theme-colors", theme] as const,
    casesPerModel: ["products", "cases-per-model"] as const,
    shopModels: ["products", "shop-models"] as const,
    shopThemes: ["products", "shop-themes"] as const,
    siblings: (theme: string, excludeSlug: string) =>
      ["products", "siblings", theme, excludeSlug] as const,
    designWithVariants: (theme: string) =>
      ["products", "design", theme, "variants"] as const,
    adminList: ["products", "admin", "list"] as const,
    adminDetail: (id: string) => ["products", "admin", "detail", id] as const,
    adminDetailWithVariants: (id: string) =>
      ["products", "admin", "detail", id, "variants"] as const,
  },
  phoneModels: {
    all: ["phoneModels"] as const,
    list: (activeOnly?: boolean) => ["phoneModels", "list", activeOnly ?? true] as const,
    adminList: ["phoneModels", "admin", "list"] as const,
  },
  orders: {
    all: ["orders"] as const,
    byNumber: (orderNumber: string) => ["orders", "number", orderNumber] as const,
    byUser: (userId: string) => ["orders", "user", userId] as const,
    adminList: ["orders", "admin", "list"] as const,
    adminDetail: (id: string) => ["orders", "admin", "detail", id] as const,
  },
} as const;
