import { notFound, redirect } from "next/navigation";

import { fetchOrderByOrderNumberOnServer } from "@/lib/queries/orders-server";

type OrderPageProps = {
  params: Promise<{ orderNumber: string }>;
};

/** Legacy order number URL — redirects to track order by document id. */
export default async function OrderPage({ params }: OrderPageProps) {
  const { orderNumber } = await params;
  const decodedOrderNumber = decodeURIComponent(orderNumber);
  const order = await fetchOrderByOrderNumberOnServer(decodedOrderNumber);

  if (!order) {
    notFound();
  }

  redirect(`/track-order?orderId=${encodeURIComponent(order.id)}`);
}
