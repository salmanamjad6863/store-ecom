import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  type DocumentData,
  type DocumentReference,
  type Firestore,
} from "firebase/firestore";

import { COLLECTIONS, SUBCOLLECTIONS } from "@/lib/firebase/collections";
import { generateOrderNumber } from "@/lib/utils/order-number";
import type { CartItem } from "@/types/cart";
import type { OrderCustomer, OrderItem } from "@/types/order";
import type { ProductColorDocument } from "@/types/product-color";

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

type VariantStockLine = {
  productId: string;
  variantId: string;
  colorId: string;
  quantity: number;
  label: string;
  variantRef: DocumentReference;
  productRef: DocumentReference;
};

type ProductStockLine = {
  productId: string;
  colorId: string;
  quantity: number;
  label: string;
  productRef: DocumentReference;
};

function formatItemLabel(item: CartItem): string {
  if (item.modelName && item.colorName) {
    return `${item.name} (${item.modelName} · ${item.colorName})`;
  }

  return item.name;
}

function mergeVariantLines(
  lines: VariantStockLine[],
  item: CartItem,
  variantRef: DocumentReference,
  productRef: DocumentReference,
): VariantStockLine[] {
  const existing = lines.find(
    (line) => line.productId === item.productId && line.variantId === item.variantId,
  );

  if (existing) {
    existing.quantity += item.quantity;
    return lines;
  }

  return [
    ...lines,
    {
      productId: item.productId,
      variantId: item.variantId,
      colorId: item.colorId,
      quantity: item.quantity,
      label: formatItemLabel(item),
      variantRef,
      productRef,
    },
  ];
}

function mergeProductLines(
  lines: ProductStockLine[],
  item: CartItem,
  productRef: DocumentReference,
): ProductStockLine[] {
  const existing = lines.find((line) => line.productId === item.productId);

  if (existing) {
    existing.quantity += item.quantity;
    return lines;
  }

  return [
    ...lines,
    {
      productId: item.productId,
      colorId: item.colorId,
      quantity: item.quantity,
      label: formatItemLabel(item),
      productRef,
    },
  ];
}

function applyColorQuantityDelta(
  colors: ProductColorDocument[] | undefined,
  colorId: string,
  delta: number,
): ProductColorDocument[] | undefined {
  if (!colors?.length || !colorId) {
    return colors;
  }

  return colors.map((color) =>
    color.colorId === colorId
      ? {
          ...color,
          totalQuantity: Math.max(0, (color.totalQuantity ?? 0) - delta),
        }
      : color,
  );
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
    let variantLines: VariantStockLine[] = [];
    let productLines: ProductStockLine[] = [];

    for (const item of input.items) {
      if (item.variantId) {
        const variantRef = doc(
          db,
          COLLECTIONS.products,
          item.productId,
          SUBCOLLECTIONS.variants,
          item.variantId,
        );
        const productRef = doc(db, COLLECTIONS.products, item.productId);
        variantLines = mergeVariantLines(variantLines, item, variantRef, productRef);
        continue;
      }

      const productRef = doc(db, COLLECTIONS.products, item.productId);
      productLines = mergeProductLines(productLines, item, productRef);
    }

    const variantSnapshots = await Promise.all(
      variantLines.map((line) =>
        Promise.all([
          transaction.get(line.variantRef),
          transaction.get(line.productRef),
        ]),
      ),
    );

    const productSnapshots = await Promise.all(
      productLines.map((line) => transaction.get(line.productRef)),
    );

    for (let index = 0; index < variantLines.length; index += 1) {
      const line = variantLines[index];
      const [variantSnapshot, productSnapshot] = variantSnapshots[index];

      if (!variantSnapshot?.exists()) {
        throw new CreateOrderError(`${line.label} is no longer available.`);
      }

      if (!productSnapshot?.exists()) {
        throw new CreateOrderError(`${line.label} is no longer available.`);
      }

      const stock = variantSnapshot.data().quantity ?? 0;

      if (stock < line.quantity) {
        throw new CreateOrderError(
          stock <= 0
            ? `${line.label} is sold out. Please update your cart.`
            : `Only ${stock} left in stock for ${line.label}. Please update your cart.`,
        );
      }
    }

    for (let index = 0; index < productLines.length; index += 1) {
      const line = productLines[index];
      const productSnapshot = productSnapshots[index];

      if (!productSnapshot.exists()) {
        throw new CreateOrderError(`${line.label} is no longer available.`);
      }

      const stock = productSnapshot.data().quantity ?? 0;

      if (stock < line.quantity) {
        throw new CreateOrderError(
          stock <= 0
            ? `${line.label} is sold out. Please update your cart.`
            : `Only ${stock} left in stock for ${line.label}. Please update your cart.`,
        );
      }
    }

    const productAdjustments = new Map<
      string,
      {
        productRef: DocumentReference;
        totalDelta: number;
        colorDeltas: Map<string, number>;
        snapshotData: DocumentData;
      }
    >();

    const trackProductAdjustment = (
      productId: string,
      productRef: DocumentReference,
      snapshotData: DocumentData,
      colorId: string,
      quantity: number,
    ) => {
      const existing = productAdjustments.get(productId);

      if (existing) {
        existing.totalDelta += quantity;
        if (colorId) {
          existing.colorDeltas.set(
            colorId,
            (existing.colorDeltas.get(colorId) ?? 0) + quantity,
          );
        }
        return;
      }

      productAdjustments.set(productId, {
        productRef,
        totalDelta: quantity,
        colorDeltas: colorId ? new Map([[colorId, quantity]]) : new Map(),
        snapshotData,
      });
    };

    for (let index = 0; index < variantLines.length; index += 1) {
      const line = variantLines[index];
      const [variantSnapshot, productSnapshot] = variantSnapshots[index];
      const currentVariantStock = variantSnapshot?.data()?.quantity ?? 0;

      transaction.update(line.variantRef, {
        quantity: currentVariantStock - line.quantity,
        updatedAt: serverTimestamp(),
      });

      trackProductAdjustment(
        line.productId,
        line.productRef,
        productSnapshot?.data() ?? {},
        line.colorId,
        line.quantity,
      );
    }

    for (let index = 0; index < productLines.length; index += 1) {
      const line = productLines[index];
      const productSnapshot = productSnapshots[index];

      trackProductAdjustment(
        line.productId,
        line.productRef,
        productSnapshot.data() ?? {},
        line.colorId,
        line.quantity,
      );
    }

    for (const adjustment of productAdjustments.values()) {
      const currentTotal = adjustment.snapshotData.totalQuantity ?? adjustment.snapshotData.quantity ?? 0;
      let colors = adjustment.snapshotData.colors as ProductColorDocument[] | undefined;

      for (const [colorId, delta] of adjustment.colorDeltas) {
        colors = applyColorQuantityDelta(colors, colorId, delta);
      }

      const nextTotal = Math.max(0, currentTotal - adjustment.totalDelta);

      transaction.update(adjustment.productRef, {
        totalQuantity: nextTotal,
        quantity: nextTotal,
        ...(colors ? { colors } : {}),
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
