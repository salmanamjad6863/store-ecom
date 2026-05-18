import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { getServerFirestore } from "@/lib/firebase/server";
import { mapOrderDoc } from "@/lib/queries/mappers";
import { toPublicOrder } from "@/lib/orders/public-order";
import { phonesMatch } from "@/lib/utils/phone";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderNumber?: string; phone?: string };
    const orderNumber = String(body.orderNumber ?? "").trim();
    const phone = String(body.phone ?? "").trim();

    if (!orderNumber || !phone) {
      return NextResponse.json(
        { error: "Order number and phone are required." },
        { status: 400 },
      );
    }

    const db = getServerFirestore();
    const snapshot = await getDocs(
      query(collection(db, COLLECTIONS.orders), where("orderNumber", "==", orderNumber)),
    );

    if (snapshot.empty) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const order = mapOrderDoc(snapshot.docs[0]);

    if (!order || !phonesMatch(order.customer.phone, phone)) {
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
