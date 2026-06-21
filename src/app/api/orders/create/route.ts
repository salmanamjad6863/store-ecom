import { after } from "next/server";
import { NextResponse } from "next/server";

import { sendAdminNewOrderEmail, sendOrderConfirmationEmail } from "@/lib/email/order-emails";
import { CreateOrderError, createOrderInFirestore } from "@/lib/orders/create-order";
import { getServerFirestore } from "@/lib/firebase/server";
import { fetchOrderByIdOnServer } from "@/lib/queries/orders-server";
import type { CartItem } from "@/types/cart";
import type { OrderCustomer } from "@/types/order";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      items?: CartItem[];
      customer?: OrderCustomer;
      userId?: string;
    };

    if (!body.items?.length || !body.customer) {
      return NextResponse.json({ error: "Invalid order data." }, { status: 400 });
    }

    const db = getServerFirestore();
    const result = await createOrderInFirestore(db, {
      items: body.items,
      customer: body.customer,
      userId: body.userId,
    });

    after(async () => {
      try {
        const order = await fetchOrderByIdOnServer(result.orderId);

        if (order) {
          await Promise.allSettled([
            sendOrderConfirmationEmail(order),
            sendAdminNewOrderEmail(order),
          ]);
        }
      } catch (error) {
        console.error("[email] Background confirmation email failed:", error);
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CreateOrderError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("[orders] Create order failed:", error);

    return NextResponse.json(
      { error: "Could not place your order. Please try again." },
      { status: 500 },
    );
  }
}
