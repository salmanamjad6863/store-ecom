import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type QueryConstraint,
} from "firebase/firestore";

import {
  dummyProducts,
  getDummyProductBySlug,
  getDummyProductWithVariantsBySlug,
  getDummyVariantsForProduct,
  isDummyProductId,
  mergeWithDummyProducts,
} from "@/lib/data/dummy-products";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getClientFirestore } from "@/lib/firebase/client";
import {
  buildColorDenormalizedFields,
  buildDesignDenormalizedFields,
} from "@/lib/utils/product-colors";
import type { Product, ProductWithVariants } from "@/types/product";
import type { ProductColorInput } from "@/types/product-color";
import type { ProductVariant, VariantInput } from "@/types/product-variant";

import { normalizeProductTypes } from "@/lib/shop/product-types";
import { toFirestoreData } from "@/lib/utils/firestore-payload";

import { mapProductDoc } from "./mappers";
import { fetchPhoneModels } from "./phone-models";
import { deleteAllVariants, fetchVariantsForProduct, saveProductVariants } from "./variants";

type FetchProductsOptions = {
  type?: string;
  modelId?: string;
  theme?: string;
  includeHidden?: boolean;
};

export async function fetchProducts(options: FetchProductsOptions = {}): Promise<Product[]> {
  const { type, modelId, theme, includeHidden = false } = options;
  const db = getClientFirestore();
  const constraints: QueryConstraint[] = [];

  if (!includeHidden) {
    constraints.push(where("hidden", "==", false));
  }

  if (modelId) {
    constraints.push(where("availableModelIds", "array-contains", modelId));
  }

  const productsQuery = query(collection(db, COLLECTIONS.products), ...constraints);
  const snapshot = await getDocs(productsQuery);

  let products = snapshot.docs
    .map((productDoc) => mapProductDoc(productDoc))
    .filter((product): product is Product => product !== null);

  products = mergeWithDummyProducts(products);

  if (type) {
    products = products.filter((product) => product.type === type);
  }

  if (theme) {
    products = products.filter(
      (product) => product.theme.toLowerCase() === theme.toLowerCase(),
    );
  }

  if (modelId) {
    products = products.filter(
      (product) =>
        !product.hasVariants ||
        (product.availableModelIds ?? []).includes(modelId),
    );
  }

  return products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const dummy = getDummyProductBySlug(slug);

  if (dummy) {
    return dummy;
  }

  const db = getClientFirestore();
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.products),
      where("slug", "==", slug),
      where("hidden", "==", false),
    ),
  );

  const product = snapshot.docs[0];

  return product ? mapProductDoc(product) : null;
}

export async function fetchProductWithVariantsBySlug(
  slug: string,
): Promise<ProductWithVariants | null> {
  const dummy = getDummyProductWithVariantsBySlug(slug);
  if (dummy) {
    return dummy;
  }

  const product = await fetchProductBySlug(slug);
  if (!product) {
    return null;
  }

  const variants = product.hasVariants ? await fetchVariantsForProduct(product.id) : [];
  return { ...product, variants };
}

export async function fetchProductTypes(): Promise<string[]> {
  const products = await fetchProducts();
  const types = products.map((product) => product.type).filter(Boolean);
  return normalizeProductTypes(types);
}

/** Unique design themes for admin dropdown. */
export async function fetchProductThemes(): Promise<string[]> {
  const products = await fetchAdminProducts();
  const themes = new Set<string>();

  for (const product of products) {
    if (product.theme?.trim()) {
      themes.add(product.theme.trim());
    }
  }

  for (const dummy of dummyProducts) {
    if (dummy.theme?.trim()) {
      themes.add(dummy.theme.trim());
    }
  }

  return Array.from(themes).sort((a, b) => a.localeCompare(b));
}

/** Count how many case designs are available per iPhone model. */
export async function countCasesPerModel(): Promise<Record<string, number>> {
  const products = await fetchAdminProducts();
  const allProducts = mergeWithDummyProducts(products);
  const counts: Record<string, number> = {};

  for (const product of allProducts) {
    if (product.hidden) {
      continue;
    }

    for (const modelId of product.availableModelIds ?? []) {
      counts[modelId] = (counts[modelId] ?? 0) + 1;
    }
  }

  return counts;
}

export async function fetchShopThemes(): Promise<string[]> {
  const products = await fetchProducts();
  const themes = new Set<string>();
  for (const product of products) {
    if (product.theme?.trim()) {
      themes.add(product.theme.trim());
    }
  }
  return Array.from(themes).sort((a, b) => a.localeCompare(b));
}

/** @deprecated Design colors are embedded — use fetchProductWithVariantsBySlug. */
export async function fetchDesignProductsWithVariants(
  _theme: string,
): Promise<ProductWithVariants[]> {
  return [];
}

/** @deprecated Sibling colors are embedded on the design product. */
export async function fetchSiblingProductsByTheme(
  _theme: string,
  _excludeSlug?: string,
): Promise<Product[]> {
  return [];
}

/** @deprecated Colors are embedded on the design product. */
export async function fetchExistingColorsInTheme(_theme: string): Promise<
  Array<{ id: string; colorId: string; colorName: string; colorHex?: string; slug: string }>
> {
  return [];
}

export async function fetchShopPhoneModelIds(): Promise<string[]> {
  const products = await fetchProducts();
  const modelIds = new Set<string>();

  for (const product of products) {
    for (const modelId of product.availableModelIds ?? []) {
      modelIds.add(modelId);
    }
  }

  const phoneModels = await fetchPhoneModels();
  return phoneModels
    .filter((model) => modelIds.has(model.id))
    .map((model) => model.id);
}

/** Admin: all Firestore products (no dummy merge). */
export async function fetchAdminProducts(): Promise<Product[]> {
  const db = getClientFirestore();
  const snapshot = await getDocs(collection(db, COLLECTIONS.products));

  return snapshot.docs
    .map((productDoc) => mapProductDoc(productDoc))
    .filter((product): product is Product => product !== null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (isDummyProductId(id)) {
    return dummyProducts.find((product) => product.id === id) ?? null;
  }

  const db = getClientFirestore();
  const snapshot = await getDoc(doc(db, COLLECTIONS.products, id));

  return mapProductDoc(snapshot);
}

export async function fetchProductWithVariantsById(
  id: string,
): Promise<ProductWithVariants | null> {
  if (isDummyProductId(id)) {
    const product = dummyProducts.find((entry) => entry.id === id);
    if (!product) {
      return null;
    }
    return { ...product, variants: getDummyVariantsForProduct(id) };
  }

  const product = await fetchProductById(id);
  if (!product) {
    return null;
  }

  const variants = product.hasVariants ? await fetchVariantsForProduct(id) : [];
  return { ...product, variants };
}

/** Fetch current catalog rows for cart sync (by product id). */
export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  const uniqueIds = [...new Set(ids)];

  if (uniqueIds.length === 0) {
    return [];
  }

  const results: Product[] = [];

  for (const id of uniqueIds) {
    const product = await fetchProductById(id);
    if (product) {
      results.push(product);
    }
  }

  return results;
}

export async function fetchProductsWithVariantsByIds(
  ids: string[],
): Promise<ProductWithVariants[]> {
  const uniqueIds = [...new Set(ids)];
  const results: ProductWithVariants[] = [];

  for (const id of uniqueIds) {
    const product = await fetchProductWithVariantsById(id);
    if (product) {
      results.push(product);
    }
  }

  return results;
}

export type ProductInput = {
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
  hidden: boolean;
  tag?: import("@/types/product-tag").ProductTag | null;
  shopFeaturedColorId?: string;
  colors: ProductColorInput[];
  variants?: VariantInput[];
  defaultVariantId?: string;
  defaultModelId?: string;
  defaultColorId?: string;
};

function enrichStoredColors(
  colors: ProductColorInput[],
  variants: ProductVariant[],
) {
  return colors.map((color) => {
    const colorVariants = variants.filter((variant) => variant.colorId === color.colorId);
    const denorm = buildColorDenormalizedFields(color.colorId, colorVariants);

    return {
      id: color.id,
      colorId: color.colorId,
      colorName: color.colorName,
      colorHex: color.colorHex,
      themeLine: color.themeLine,
      images: color.images,
      availableModelIds: denorm.availableModelIds,
      heroImage: denorm.heroImage ?? undefined,
      totalQuantity: denorm.totalQuantity,
    };
  });
}

function buildProductPayload(
  input: ProductInput,
  savedVariants: ProductVariant[] = [],
) {
  const storedColors = enrichStoredColors(input.colors, savedVariants);
  const designDenorm = buildDesignDenormalizedFields(
    storedColors.map((color) => ({
      ...color,
      id: color.id ?? color.colorId,
      colorHex: color.colorHex ?? undefined,
      themeLine: color.themeLine ?? undefined,
      images: color.images ?? [],
    })),
    savedVariants,
    input.defaultVariantId,
  );

  const featuredColor =
    storedColors.find((color) => color.colorId === input.shopFeaturedColorId) ??
    storedColors[0];

  return {
    name: input.name,
    slug: input.slug,
    theme: input.theme,
    type: input.type,
    description: input.description,
    images: featuredColor?.images ?? input.images,
    price: input.price,
    ...(input.onSale && input.salePrice !== undefined
      ? { salePrice: input.salePrice, salePercent: input.salePercent ?? null }
      : { salePrice: null, salePercent: null }),
    onSale: input.onSale,
    hidden: input.hidden,
    tag: input.tag ?? null,
    colors: storedColors,
    shopFeaturedColorId: input.shopFeaturedColorId ?? featuredColor?.colorId ?? null,
    hasVariants: designDenorm.hasVariants,
    availableModelIds: designDenorm.availableModelIds,
    defaultVariantId: designDenorm.defaultVariantId,
    heroImage: designDenorm.heroImage,
    totalQuantity: designDenorm.totalQuantity,
    quantity: designDenorm.quantity,
  };
}

async function finalizeProductVariants(
  productId: string,
  input: ProductInput,
): Promise<ProductVariant[]> {
  const variants = input.variants ?? [];
  if (variants.length === 0) {
    await deleteAllVariants(productId);
    return [];
  }
  return saveProductVariants(productId, variants);
}

export async function createProduct(input: ProductInput): Promise<string> {
  const db = getClientFirestore();

  const docRef = await addDoc(
    collection(db, COLLECTIONS.products),
    toFirestoreData({
      ...buildProductPayload(input),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );

  try {
    const saved = await finalizeProductVariants(docRef.id, input);
    const defaultVariantId =
      input.defaultVariantId ??
      saved.find(
        (variant) =>
          variant.colorId === input.defaultColorId &&
          variant.modelId === input.defaultModelId,
      )?.id ??
      saved.find(
        (variant) => variant.colorId === input.shopFeaturedColorId && variant.quantity > 0,
      )?.id ??
      saved[0]?.id;

    await updateDoc(
      docRef,
      toFirestoreData({
        ...buildProductPayload({ ...input, defaultVariantId }, saved),
        updatedAt: serverTimestamp(),
      }),
    );
  } catch (error) {
    await deleteDoc(docRef).catch(() => undefined);
    throw error;
  }

  return docRef.id;
}

export class DeleteProductError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeleteProductError";
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (isDummyProductId(id)) {
    throw new DeleteProductError("The sample product cannot be deleted.");
  }

  const db = getClientFirestore();
  const snapshot = await getDoc(doc(db, COLLECTIONS.products, id));

  if (!snapshot.exists()) {
    throw new DeleteProductError("Product not found or already deleted.");
  }

  await deleteAllVariants(id);
  await deleteDoc(doc(db, COLLECTIONS.products, id));
}

export async function updateProduct(id: string, input: ProductInput): Promise<void> {
  const db = getClientFirestore();
  const saved = await finalizeProductVariants(id, input);
  const defaultVariantId =
    input.defaultVariantId ??
    saved.find(
      (variant) =>
        variant.colorId === input.defaultColorId &&
        variant.modelId === input.defaultModelId,
    )?.id ??
    saved[0]?.id;

  await updateDoc(
    doc(db, COLLECTIONS.products, id),
    toFirestoreData({
      ...buildProductPayload({ ...input, defaultVariantId }, saved),
      updatedAt: serverTimestamp(),
    }),
  );
}
