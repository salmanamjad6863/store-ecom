import { NextResponse } from "next/server";

import { getBearerToken, verifyFirebaseIdToken } from "@/lib/auth/verify-firebase-token";
import { isAdminEmail } from "@/lib/auth/admin";
import { sendOrderAcceptedEmail } from "@/lib/email/order-emails";
import {
  fetchOrderByIdOnServer,
  updateOrderStatusOnServer,
} from "@/lib/queries/orders-server";
import { ORDER_STATUSES, type OrderStatus } from "@/types/order";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const token = getBearerToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const verified = await verifyFirebaseIdToken(token);

    if (!isAdminEmail(verified.email)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { id } = await context.params;
    const body = (await request.json()) as { status?: string };
    const status = body.status as OrderStatus;

    if (!ORDER_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const existing = await fetchOrderByIdOnServer(id);

    if (!existing) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const updated = await updateOrderStatusOnServer(id, status);

    if (!updated) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const wasAccepted = existing.status !== "transferred" && status === "transferred";

    if (wasAccepted) {
      try {
        await sendOrderAcceptedEmail(updated);
      } catch (error) {
        console.error("[email] Failed to send order accepted email:", error);
      }
    }

    return NextResponse.json({ order: updated, emailSent: wasAccepted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update order status.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
