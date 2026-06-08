import { DocumentSnapshot, QueryDocumentSnapshot } from "firebase/firestore";
import { nanoid } from "nanoid";

import { timestampToDate } from "@/lib/utils/firestore";
import type { Order, OrderDocument } from "@/types/order";
import type { PhoneModel, PhoneModelDocument } from "@/types/phone-model";
import type { Product, ProductDocument } from "@/types/product";
import type { ProductColor } from "@/types/product-color";
import type { ProductVariant, ProductVariantDocument } from "@/types/product-variant";
import type { UserProfile, UserProfileDocument } from "@/types/user";

function mapLegacyProductToColors(data: ProductDocument): ProductColor[] {
  if (data.colors && data.colors.length > 0) {
    return data.colors.map((color, index) => ({
      id: (color as ProductColor).id ?? `color-${index}`,
      colorId: color.colorId,
      colorName: color.colorName,
      colorHex: color.colorHex,
      themeLine: color.themeLine,
      images: color.images ?? [],
      heroImage: color.heroImage,
      availableModelIds: color.availableModelIds ?? [],
      totalQuantity: color.totalQuantity,
    }));
  }

  const legacy = data as ProductDocument & {
    colorId?: string;
    colorName?: string;
    colorHex?: string;
    themeLine?: string;
  };

  if (legacy.colorName || legacy.colorId) {
    return [
      {
        id: legacy.colorId ?? "default",
        colorId: legacy.colorId ?? "default",
        colorName: legacy.colorName ?? "Default",
        colorHex: legacy.colorHex,
        themeLine: legacy.themeLine,
        images: legacy.images ?? [],
        heroImage: legacy.heroImage ?? undefined,
        availableModelIds: legacy.availableModelIds ?? [],
        totalQuantity: legacy.totalQuantity,
      },
    ];
  }

  return [
    {
      id: "default",
      colorId: "default",
      colorName: "Default",
      images: data.images ?? [],
      heroImage: data.heroImage ?? undefined,
      availableModelIds: data.availableModelIds ?? [],
      totalQuantity: data.totalQuantity,
    },
  ];
}

export function mapProductDoc(
  doc: QueryDocumentSnapshot | DocumentSnapshot,
): Product | null {
  if (!doc.exists()) {
    return null;
  }

  const data = doc.data() as ProductDocument;
  const colors = mapLegacyProductToColors(data);

  return {
    id: doc.id,
    name: data.name,
    slug: data.slug,
    theme: data.theme ?? data.name ?? "General",
    type: data.type,
    description: data.description,
    images: data.images ?? colors[0]?.images ?? [],
    price: data.price,
    salePrice: data.salePrice,
    salePercent: data.salePercent,
    onSale: data.onSale ?? false,
    tag: data.tag === "new" || data.tag === "hot" ? data.tag : null,
    quantity: data.quantity ?? 0,
    hidden: data.hidden ?? false,
    colors,
    shopFeaturedColorId: data.shopFeaturedColorId ?? colors[0]?.colorId,
    hasVariants: data.hasVariants ?? false,
    defaultVariantId: data.defaultVariantId,
    availableModelIds: data.availableModelIds ?? [],
    heroImage: data.heroImage,
    totalQuantity: data.totalQuantity,
    createdAt: timestampToDate(data.createdAt as never) ?? new Date(),
    updatedAt: timestampToDate(data.updatedAt as never) ?? new Date(),
  };
}

export function mapVariantDoc(
  doc: QueryDocumentSnapshot | DocumentSnapshot,
  productId: string,
): ProductVariant | null {
  if (!doc.exists()) {
    return null;
  }

  const data = doc.data() as ProductVariantDocument & { colorId?: string };

  return {
    id: doc.id,
    productId,
    colorId: data.colorId ?? "default",
    modelId: data.modelId,
    modelName: data.modelName,
    images: data.images ?? [],
    quantity: data.quantity ?? 0,
    price:
      typeof data.price === "number" && Number.isFinite(data.price) && data.price > 0
        ? data.price
        : undefined,
    sku: data.sku,
  };
}

export function createColorId(): string {
  return nanoid(10);
}

export function mapOrderDoc(doc: QueryDocumentSnapshot | DocumentSnapshot): Order | null {
  if (!doc.exists()) {
    return null;
  }

  const data = doc.data() as OrderDocument;

  return {
    id: doc.id,
    orderNumber: data.orderNumber,
    status: data.status,
    paymentMethod: data.paymentMethod,
    items: data.items ?? [],
    customer: data.customer,
    userId: data.userId,
    subtotal: data.subtotal,
    shipping: data.shipping ?? 0,
    total: data.total,
    createdAt: timestampToDate(data.createdAt as never) ?? new Date(),
    updatedAt: timestampToDate(data.updatedAt as never) ?? new Date(),
  };
}

export function mapPhoneModelDoc(
  doc: QueryDocumentSnapshot | DocumentSnapshot,
): PhoneModel | null {
  if (!doc.exists()) {
    return null;
  }

  const data = doc.data() as PhoneModelDocument;

  return {
    id: doc.id,
    name: data.name,
    slug: data.slug,
    sortOrder: data.sortOrder ?? 0,
    active: data.active ?? true,
  };
}

export function mapUserDoc(doc: DocumentSnapshot, uid: string): UserProfile | null {
  if (!doc.exists()) {
    return null;
  }

  const data = doc.data() as UserProfileDocument;

  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    phone: data.phone,
    createdAt: timestampToDate(data.createdAt as never) ?? new Date(),
  };
}
