import {
  doc,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

import { isDummyProductId } from "@/lib/data/dummy-products";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/lib/firebase/collections";
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
    type RestoreTarget =
      | {
          kind: "variant";
          item: (typeof restorableItems)[number];
          variantRef: ReturnType<typeof doc>;
          productRef: ReturnType<typeof doc>;
        }
      | {
          kind: "product";
          item: (typeof restorableItems)[number];
          productRef: ReturnType<typeof doc>;
        };

    const targets: RestoreTarget[] = restorableItems.map((item) => {
      if (item.variantId) {
        return {
          kind: "variant" as const,
          item,
          variantRef: doc(
            db,
            COLLECTIONS.products,
            item.productId,
            SUBCOLLECTIONS.variants,
            item.variantId,
          ),
          productRef: doc(db, COLLECTIONS.products, item.productId),
        };
      }

      return {
        kind: "product" as const,
        item,
        productRef: doc(db, COLLECTIONS.products, item.productId),
      };
    });

    const snapshots = await Promise.all(
      targets.map((target) => {
        if (target.kind === "variant") {
          return Promise.all([
            transaction.get(target.variantRef),
            transaction.get(target.productRef),
          ]);
        }

        return Promise.all([transaction.get(target.productRef)]);
      }),
    );

    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];

      if (target.kind === "variant") {
        const variantSnapshot = snapshots[index][0];
        const productSnapshot = snapshots[index][1];

        if (variantSnapshot?.exists()) {
          const currentStock = variantSnapshot.data()?.quantity ?? 0;
          transaction.update(target.variantRef, {
            quantity: currentStock + target.item.quantity,
            updatedAt: serverTimestamp(),
          });
        }

        if (productSnapshot?.exists()) {
          const currentTotal = productSnapshot.data()?.totalQuantity ?? 0;
          transaction.update(target.productRef, {
            totalQuantity: currentTotal + target.item.quantity,
            quantity: currentTotal + target.item.quantity,
            updatedAt: serverTimestamp(),
          });
        }

        continue;
      }

      const productSnapshot = snapshots[index][0];

      if (!productSnapshot.exists()) {
        continue;
      }

      const currentStock = productSnapshot.data()?.quantity ?? 0;

      transaction.update(target.productRef, {
        quantity: currentStock + target.item.quantity,
        updatedAt: serverTimestamp(),
      });
    }
  });
}
