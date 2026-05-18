import { NextResponse } from "next/server";

import { sendOrderConfirmationEmail } from "@/lib/email/order-emails";
import {
  fetchOrderByIdOnServer,
  fetchOrderByOrderNumberOnServer,
} from "@/lib/queries/orders-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderId?: string; orderNumber?: string };
    const orderId = String(body.orderId ?? "").trim();
    const orderNumber = String(body.orderNumber ?? "").trim();

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { error: "orderId or orderNumber is required." },
        { status: 400 },
      );
    }

    const order = orderId
      ? await fetchOrderByIdOnServer(orderId)
      : await fetchOrderByOrderNumberOnServer(orderNumber);

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    await sendOrderConfirmationEmail(order);

    return NextResponse.json({ ok: true, email: order.customer.email });
  } catch (error) {
    console.error("[email] Order confirmation failed:", error);

    const message =
      error instanceof Error ? error.message : "Could not send confirmation email.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
