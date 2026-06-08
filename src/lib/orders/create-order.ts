import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

import { COLLECTIONS, SUBCOLLECTIONS } from "@/lib/firebase/collections";
import { generateOrderNumber } from "@/lib/utils/order-number";
import type { CartItem } from "@/types/cart";
import type { OrderCustomer, OrderItem } from "@/types/order";

export class CreateOrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreateOrderError";
  }
}

export type CreateOrderInput = {
  items: CartItem[];
  customer: OrderCustomer;
  userId?: string;
};

export type CreateOrderResult = {
  orderNumber: string;
  orderId: string;
};

function formatItemLabel(item: CartItem): string {
  if (item.modelName && item.colorName) {
    return `${item.name} (${item.modelName} · ${item.colorName})`;
  }

  return item.name;
}

export async function createOrderInFirestore(
  db: Firestore,
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  if (input.items.length === 0) {
    throw new CreateOrderError("Your cart is empty.");
  }

  const orderNumber = generateOrderNumber();
  const subtotal = input.items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  const shipping = 0;
  const total = subtotal + shipping;

  const orderItems: OrderItem[] = input.items.map((item) => ({
    productId: item.productId,
    ...(item.colorId ? { colorId: item.colorId } : {}),
    ...(item.variantId ? { variantId: item.variantId } : {}),
    name: item.name,
    slug: item.slug,
    image: item.image,
    ...(item.modelName ? { modelName: item.modelName } : {}),
    ...(item.colorName ? { colorName: item.colorName } : {}),
    unitPrice: item.unitPrice,
    quantity: item.quantity,
  }));

  const orderRef = doc(collection(db, COLLECTIONS.orders));

  await runTransaction(db, async (transaction) => {
    type StockTarget =
      | {
          kind: "variant";
          item: CartItem;
          variantRef: ReturnType<typeof doc>;
          productRef: ReturnType<typeof doc>;
        }
      | {
          kind: "product";
          item: CartItem;
          productRef: ReturnType<typeof doc>;
        };

    const targets: StockTarget[] = input.items.map((item) => {
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
      const label = formatItemLabel(target.item);

      if (target.kind === "variant") {
        const variantSnapshot = snapshots[index][0];
        const productSnapshot = snapshots[index][1];

        if (!variantSnapshot?.exists()) {
          throw new CreateOrderError(`${label} is no longer available.`);
        }

        const stock = variantSnapshot.data().quantity ?? 0;

        if (stock < target.item.quantity) {
          throw new CreateOrderError(
            `Only ${stock} left in stock for ${label}. Please update your cart.`,
          );
        }

        if (!productSnapshot?.exists()) {
          throw new CreateOrderError(`${label} is no longer available.`);
        }

        continue;
      }

      const [productSnapshot] = snapshots[index];

      if (!productSnapshot.exists()) {
        throw new CreateOrderError(`${label} is no longer available.`);
      }

      const stock = productSnapshot.data().quantity ?? 0;

      if (stock < target.item.quantity) {
        throw new CreateOrderError(
          `Only ${stock} left in stock for ${label}. Please update your cart.`,
        );
      }
    }

    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];

      if (target.kind === "variant") {
        const variantSnapshot = snapshots[index][0];
        const productSnapshot = snapshots[index][1];
        const currentVariantStock = variantSnapshot?.data()?.quantity ?? 0;
        const currentTotal = productSnapshot?.data()?.totalQuantity ?? 0;

        transaction.update(target.variantRef, {
          quantity: currentVariantStock - target.item.quantity,
          updatedAt: serverTimestamp(),
        });

        transaction.update(target.productRef, {
          totalQuantity: Math.max(0, currentTotal - target.item.quantity),
          quantity: Math.max(0, currentTotal - target.item.quantity),
          updatedAt: serverTimestamp(),
        });

        continue;
      }

      const [productSnapshot] = snapshots[index];
      const currentStock = productSnapshot.data()?.quantity ?? 0;

      transaction.update(target.productRef, {
        quantity: currentStock - target.item.quantity,
        updatedAt: serverTimestamp(),
      });
    }

    transaction.set(orderRef, {
      orderNumber,
      status: "pending",
      paymentMethod: "cod",
      items: orderItems,
      customer: {
        ...input.customer,
        ...(input.customer.postalCode ? { postalCode: input.customer.postalCode } : {}),
        ...(input.customer.notes ? { notes: input.customer.notes } : {}),
      },
      ...(input.userId ? { userId: input.userId } : {}),
      subtotal,
      shipping,
      total,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return { orderNumber, orderId: orderRef.id };
}
