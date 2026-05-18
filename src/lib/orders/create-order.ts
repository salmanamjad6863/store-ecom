import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

import { isDummyProductId } from "@/lib/data/dummy-products";
import { COLLECTIONS } from "@/lib/firebase/collections";
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
    name: item.name,
    slug: item.slug,
    image: item.image,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
  }));

  const firestoreItems = input.items.filter((item) => !isDummyProductId(item.productId));
  const orderRef = doc(collection(db, COLLECTIONS.orders));

  await runTransaction(db, async (transaction) => {
    const productRefs = firestoreItems.map((item) =>
      doc(db, COLLECTIONS.products, item.productId),
    );

    const productSnapshots = await Promise.all(
      productRefs.map((productRef) => transaction.get(productRef)),
    );

    for (let index = 0; index < firestoreItems.length; index += 1) {
      const item = firestoreItems[index];
      const snapshot = productSnapshots[index];

      if (!snapshot.exists()) {
        throw new CreateOrderError(`${item.name} is no longer available.`);
      }

      const stock = snapshot.data().quantity ?? 0;

      if (stock < item.quantity) {
        throw new CreateOrderError(
          `Only ${stock} left in stock for ${item.name}. Please update your cart.`,
        );
      }
    }

    for (let index = 0; index < firestoreItems.length; index += 1) {
      const item = firestoreItems[index];
      const snapshot = productSnapshots[index];
      const currentStock = snapshot.data()?.quantity ?? 0;

      transaction.update(productRefs[index], {
        quantity: currentStock - item.quantity,
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
