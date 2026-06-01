import { DocumentSnapshot, QueryDocumentSnapshot } from "firebase/firestore";

import { timestampToDate } from "@/lib/utils/firestore";
import type { Order, OrderDocument } from "@/types/order";
import type { Product, ProductDocument } from "@/types/product";
import type { UserProfile, UserProfileDocument } from "@/types/user";

export function mapProductDoc(
  doc: QueryDocumentSnapshot | DocumentSnapshot,
): Product | null {
  if (!doc.exists()) {
    return null;
  }

  const data = doc.data() as ProductDocument;

  return {
    id: doc.id,
    name: data.name,
    slug: data.slug,
    type: data.type,
    description: data.description,
    images: data.images ?? [],
    price: data.price,
    salePrice: data.salePrice,
    salePercent: data.salePercent,
    onSale: data.onSale ?? false,
    quantity: data.quantity ?? 0,
    hidden: data.hidden ?? false,
    createdAt: timestampToDate(data.createdAt as never) ?? new Date(),
    updatedAt: timestampToDate(data.updatedAt as never) ?? new Date(),
  };
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
