import type { Product, ProductWithVariants } from "@/types/product";
import type { ProductVariant } from "@/types/product-variant";

export const DUMMY_PRODUCT_ID = "dummy-sample-cotton-tee";
export const DUMMY_COSMIC_WAVE_ID = "dummy-cosmic-wave";

const now = new Date();

const cosmicVariants: ProductVariant[] = [
  {
    id: "v-blue-17",
    productId: DUMMY_COSMIC_WAVE_ID,
    colorId: "ocean-blue",
    modelId: "iphone-17",
    modelName: "iPhone 17",
    images: ["https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=800&fit=crop"],
    quantity: 20,
  },
  {
    id: "v-blue-17pro",
    productId: DUMMY_COSMIC_WAVE_ID,
    colorId: "ocean-blue",
    modelId: "iphone-17-pro",
    modelName: "iPhone 17 Pro",
    images: ["https://images.unsplash.com/photo-1598327275665-79b184c97559?w=800&h=800&fit=crop"],
    quantity: 10,
  },
  {
    id: "v-black-17",
    productId: DUMMY_COSMIC_WAVE_ID,
    colorId: "midnight-black",
    modelId: "iphone-17",
    modelName: "iPhone 17",
    images: ["https://images.unsplash.com/photo-1601814933826-fc0e4a49d5ff?w=800&h=800&fit=crop"],
    quantity: 15,
  },
  {
    id: "v-black-15",
    productId: DUMMY_COSMIC_WAVE_ID,
    colorId: "midnight-black",
    modelId: "iphone-15",
    modelName: "iPhone 15",
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=800&fit=crop"],
    quantity: 5,
  },
];

export const dummyProducts: Product[] = [
  {
    id: DUMMY_PRODUCT_ID,
    name: "Sample Cotton Tee",
    slug: "sample-cotton-tee",
    theme: "Apparel",
    type: "Clothing",
    description: "Demo product for testing checkout.",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop"],
    price: 299900,
    salePrice: 199900,
    salePercent: 33,
    onSale: true,
    quantity: 25,
    hidden: false,
    colors: [
      {
        id: "default",
        colorId: "default",
        colorName: "Default",
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop"],
        totalQuantity: 25,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: DUMMY_COSMIC_WAVE_ID,
    name: "Cosmic Wave",
    slug: "cosmic-wave",
    theme: "Cosmic Wave",
    type: "iPhone Cases",
    description: "Cosmic Wave case collection. Select your color and iPhone model.",
    images: ["https://images.unsplash.com/photo-1598327275665-79b184c97559?w=800&h=800&fit=crop"],
    price: 249900,
    onSale: false,
    quantity: 50,
    hidden: false,
    tag: "new",
    hasVariants: true,
    shopFeaturedColorId: "ocean-blue",
    defaultVariantId: "v-blue-17pro",
    availableModelIds: ["iphone-17", "iphone-17-pro", "iphone-15"],
    heroImage: "https://images.unsplash.com/photo-1598327275665-79b184c97559?w=800&h=800&fit=crop",
    totalQuantity: 50,
    colors: [
      {
        id: "color-blue",
        colorId: "ocean-blue",
        colorName: "Ocean Blue",
        colorHex: "#1e4d8c",
        themeLine: "Deep ocean tones with a subtle wave shimmer",
        images: ["https://images.unsplash.com/photo-1598327275665-79b184c97559?w=800&h=800&fit=crop"],
        heroImage: "https://images.unsplash.com/photo-1598327275665-79b184c97559?w=800&h=800&fit=crop",
        availableModelIds: ["iphone-17", "iphone-17-pro"],
        totalQuantity: 30,
      },
      {
        id: "color-black",
        colorId: "midnight-black",
        colorName: "Midnight Black",
        colorHex: "#1a1a1a",
        themeLine: "Sleek matte finish for a bold, understated look",
        images: ["https://images.unsplash.com/photo-1601814933826-fc0e4a49d5ff?w=800&h=800&fit=crop"],
        heroImage: "https://images.unsplash.com/photo-1601814933826-fc0e4a49d5ff?w=800&h=800&fit=crop",
        availableModelIds: ["iphone-17", "iphone-15"],
        totalQuantity: 20,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
];

const dummyVariantsByProductId = new Map<string, ProductVariant[]>([
  [DUMMY_COSMIC_WAVE_ID, cosmicVariants],
]);

export function isDummyProductId(productId: string): boolean {
  return productId === DUMMY_PRODUCT_ID || productId === DUMMY_COSMIC_WAVE_ID;
}

export function getDummyProductBySlug(slug: string): Product | null {
  return dummyProducts.find((product) => product.slug === slug) ?? null;
}

export function getDummyProductWithVariantsBySlug(slug: string): ProductWithVariants | null {
  const product = getDummyProductBySlug(slug);
  if (!product) {
    return null;
  }
  return { ...product, variants: dummyVariantsByProductId.get(product.id) ?? [] };
}

export function getDummyVariantsForProduct(productId: string): ProductVariant[] {
  return dummyVariantsByProductId.get(productId) ?? [];
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
