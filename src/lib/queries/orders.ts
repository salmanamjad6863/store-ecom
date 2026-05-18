import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { getClientFirestore } from "@/lib/firebase/client";
import {
  CreateOrderError,
  createOrderInFirestore,
  type CreateOrderInput,
  type CreateOrderResult,
} from "@/lib/orders/create-order";
import { restoreOrderStock, shouldRestoreStockOnCancel } from "@/lib/orders/inventory";
import type { Order, OrderStatus } from "@/types/order";

import { mapOrderDoc } from "./mappers";

export { CreateOrderError, type CreateOrderInput };

export async function fetchOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
  const db = getClientFirestore();
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.orders), where("orderNumber", "==", orderNumber)),
  );

  const orderDoc = snapshot.docs[0];

  return orderDoc ? mapOrderDoc(orderDoc) : null;
}

export async function fetchOrdersByUserId(userId: string): Promise<Order[]> {
  const db = getClientFirestore();
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.orders), where("userId", "==", userId)),
  );

  return snapshot.docs
    .map((orderDoc) => mapOrderDoc(orderDoc))
    .filter((order): order is Order => order !== null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  return createOrderInFirestore(getClientFirestore(), input);
}

export async function fetchAllOrders(): Promise<Order[]> {
  const db = getClientFirestore();
  const snapshot = await getDocs(collection(db, COLLECTIONS.orders));

  return snapshot.docs
    .map((orderDoc) => mapOrderDoc(orderDoc))
    .filter((order): order is Order => order !== null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const db = getClientFirestore();
  const snapshot = await getDoc(doc(db, COLLECTIONS.orders, id));

  return mapOrderDoc(snapshot);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const db = getClientFirestore();
  const existing = await fetchOrderById(id);

  if (!existing) {
    throw new Error("Order not found.");
  }

  if (shouldRestoreStockOnCancel(existing.status, status)) {
    await restoreOrderStock(db, existing);
  }

  await updateDoc(doc(db, COLLECTIONS.orders, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}
