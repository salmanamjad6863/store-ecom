import {
  doc,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

import { isDummyProductId } from "@/lib/data/dummy-products";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { Order, OrderStatus } from "@/types/order";

export function shouldRestoreStockOnCancel(
  previousStatus: OrderStatus,
  newStatus: OrderStatus,
): boolean {
  return newStatus === "cancelled" && previousStatus !== "cancelled";
}

/** Return reserved quantities to product stock when an order is cancelled. */
export async function restoreOrderStock(db: Firestore, order: Order): Promise<void> {
  const restorableItems = order.items.filter((item) => !isDummyProductId(item.productId));

  if (restorableItems.length === 0) {
    return;
  }

  await runTransaction(db, async (transaction) => {
    const productRefs = restorableItems.map((item) =>
      doc(db, COLLECTIONS.products, item.productId),
    );

    const snapshots = await Promise.all(
      productRefs.map((productRef) => transaction.get(productRef)),
    );

    for (let index = 0; index < restorableItems.length; index += 1) {
      const item = restorableItems[index];
      const snapshot = snapshots[index];

      if (!snapshot.exists()) {
        continue;
      }

      const currentStock = snapshot.data()?.quantity ?? 0;

      transaction.update(productRefs[index], {
        quantity: currentStock + item.quantity,
        updatedAt: serverTimestamp(),
      });
    }
  });
}
