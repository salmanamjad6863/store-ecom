import type { Order } from "@/types/order";

export type OrderMonthFilter = "all" | "this_month";

export function isSameCalendarMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function filterOrdersByMonth(
  orders: Order[],
  filter: OrderMonthFilter,
  referenceDate = new Date(),
): Order[] {
  if (filter === "all") {
    return orders;
  }

  return orders.filter((order) => isSameCalendarMonth(order.createdAt, referenceDate));
}

export function getMonthlyOrderStats(orders: Order[], referenceDate = new Date()) {
  const monthOrders = filterOrdersByMonth(orders, "this_month", referenceDate);
  const revenueOrders = monthOrders.filter((order) => order.status !== "cancelled");

  return {
    orderCount: monthOrders.length,
    revenue: revenueOrders.reduce((sum, order) => sum + order.total, 0),
    monthLabel: referenceDate.toLocaleString("en-US", { month: "long", year: "numeric" }),
  };
}
