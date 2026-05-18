import type { Product } from "@/types/product";

/** Static product for local testing (no Firestore seed required). */
export const DUMMY_PRODUCT_ID = "dummy-sample-cotton-tee";

const now = new Date();

export const dummyProducts: Product[] = [
  {
    id: DUMMY_PRODUCT_ID,
    name: "Sample Cotton Tee",
    slug: "sample-cotton-tee",
    type: "Clothing",
    description:
      "A comfortable everyday cotton tee for testing the shop, cart, and checkout flow. This is a static demo product.",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
    ],
    price: 299900,
    salePrice: 199900,
    onSale: true,
    quantity: 25,
    hidden: false,
    createdAt: now,
    updatedAt: now,
  },
];

export function isDummyProductId(productId: string): boolean {
  return productId === DUMMY_PRODUCT_ID;
}

export function getDummyProductBySlug(slug: string): Product | null {
  return dummyProducts.find((product) => product.slug === slug) ?? null;
}

export function mergeWithDummyProducts(products: Product[]): Product[] {
  const bySlug = new Map<string, Product>();

  for (const dummy of dummyProducts) {
    if (!dummy.hidden) {
      bySlug.set(dummy.slug, dummy);
    }
  }

  for (const product of products) {
    bySlug.set(product.slug, product);
  }

  return Array.from(bySlug.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}
