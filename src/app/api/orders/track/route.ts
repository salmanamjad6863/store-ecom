import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { getServerFirestore } from "@/lib/firebase/server";
import { mapOrderDoc } from "@/lib/queries/mappers";
import { toPublicOrder } from "@/lib/orders/public-order";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderId?: string };
    const orderId = String(body.orderId ?? "").trim();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const db = getServerFirestore();
    const snapshot = await getDoc(doc(db, COLLECTIONS.orders, orderId));
    const order = mapOrderDoc(snapshot);

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ order: toPublicOrder(order) });
  } catch {
    return NextResponse.json(
      { error: "Could not look up your order. Please try again." },
      { status: 500 },
    );
  }
}
