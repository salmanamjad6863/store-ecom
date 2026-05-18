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
import { getServerFirestore } from "@/lib/firebase/server";
import { restoreOrderStock, shouldRestoreStockOnCancel } from "@/lib/orders/inventory";
import type { Order, OrderStatus } from "@/types/order";

import { mapOrderDoc } from "./mappers";

export async function fetchOrderByOrderNumberOnServer(
  orderNumber: string,
): Promise<Order | null> {
  const db = getServerFirestore();
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.orders), where("orderNumber", "==", orderNumber)),
  );

  const orderDoc = snapshot.docs[0];

  return orderDoc ? mapOrderDoc(orderDoc) : null;
}

export async function fetchOrderByIdOnServer(id: string): Promise<Order | null> {
  const db = getServerFirestore();
  const snapshot = await getDoc(doc(db, COLLECTIONS.orders, id));

  return mapOrderDoc(snapshot);
}

export async function updateOrderStatusOnServer(
  id: string,
  status: OrderStatus,
): Promise<Order | null> {
  const db = getServerFirestore();
  const existing = await fetchOrderByIdOnServer(id);

  if (!existing) {
    return null;
  }

  if (shouldRestoreStockOnCancel(existing.status, status)) {
    await restoreOrderStock(db, existing);
  }

  const orderRef = doc(db, COLLECTIONS.orders, id);

  await updateDoc(orderRef, {
    status,
    updatedAt: serverTimestamp(),
  });

  return fetchOrderByIdOnServer(id);
}
