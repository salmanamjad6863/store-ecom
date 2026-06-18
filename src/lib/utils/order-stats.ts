import type { Order, OrderStatus } from "@/types/order";

export type OrderPeriodPreset = "all" | "today" | "this_week" | "this_month" | "pick_month";

export type OrderStatusFilter = "all" | OrderStatus;

export function isSameCalendarMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date): Date {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function parsePickedMonth(value: string): { year: number; month: number } | null {
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > 12) {
    return null;
  }

  return { year, month: month - 1 };
}

export function formatPickedMonthLabel(value: string): string {
  const parsed = parsePickedMonth(value);
  if (!parsed) {
    return value;
  }

  return new Date(parsed.year, parsed.month, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function getOrderMonthOptions(orders: Order[]): Array<{ value: string; label: string }> {
  const months = new Set<string>();

  for (const order of orders) {
    const year = order.createdAt.getFullYear();
    const month = String(order.createdAt.getMonth() + 1).padStart(2, "0");
    months.add(`${year}-${month}`);
  }

  return Array.from(months)
    .sort((a, b) => b.localeCompare(a))
    .map((value) => ({
      value,
      label: formatPickedMonthLabel(value),
    }));
}

export function getPeriodLabel(
  preset: OrderPeriodPreset,
  pickedMonth: string | null,
  referenceDate = new Date(),
): string {
  if (preset === "all") {
    return "All time";
  }

  if (preset === "today") {
    return referenceDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  if (preset === "this_week") {
    return "This week";
  }

  if (preset === "this_month") {
    return referenceDate.toLocaleString("en-US", { month: "long", year: "numeric" });
  }

  if (preset === "pick_month" && pickedMonth) {
    return formatPickedMonthLabel(pickedMonth);
  }

  return "Selected period";
}

export function isOrderInPeriod(
  order: Order,
  preset: OrderPeriodPreset,
  pickedMonth: string | null,
  referenceDate = new Date(),
): boolean {
  if (preset === "all") {
    return true;
  }

  const createdAt = order.createdAt;

  if (preset === "today") {
    return createdAt >= startOfDay(referenceDate);
  }

  if (preset === "this_week") {
    return createdAt >= startOfWeek(referenceDate);
  }

  if (preset === "this_month") {
    return isSameCalendarMonth(createdAt, referenceDate);
  }

  if (preset === "pick_month" && pickedMonth) {
    const parsed = parsePickedMonth(pickedMonth);
    if (!parsed) {
      return true;
    }

    return createdAt.getFullYear() === parsed.year && createdAt.getMonth() === parsed.month;
  }

  return true;
}

export function filterOrdersByPeriod(
  orders: Order[],
  preset: OrderPeriodPreset,
  pickedMonth: string | null,
  referenceDate = new Date(),
): Order[] {
  return orders.filter((order) => isOrderInPeriod(order, preset, pickedMonth, referenceDate));
}

export function filterOrdersByStatus(orders: Order[], filter: OrderStatusFilter): Order[] {
  if (filter === "all") {
    return orders;
  }

  return orders.filter((order) => order.status === filter);
}

export function filterOrdersBySearch(orders: Order[], query: string): Order[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return orders;
  }

  const normalizedPhoneQuery = normalizedQuery.replace(/\s+/g, "");

  return orders.filter((order) => {
    const orderNumber = order.orderNumber.toLowerCase();
    const customerName = order.customer.name.toLowerCase();
    const customerPhone = order.customer.phone.replace(/\s+/g, "").toLowerCase();

    return (
      orderNumber.includes(normalizedQuery) ||
      customerName.includes(normalizedQuery) ||
      customerPhone.includes(normalizedPhoneQuery)
    );
  });
}

export type OrderPeriodStats = {
  periodLabel: string;
  deliveredRevenue: number;
  deliveredCount: number;
  pendingCount: number;
  transferredCount: number;
  needsActionCount: number;
};

export function getOrderPeriodStats(
  orders: Order[],
  preset: OrderPeriodPreset,
  pickedMonth: string | null,
  referenceDate = new Date(),
): OrderPeriodStats {
  const periodOrders = filterOrdersByPeriod(orders, preset, pickedMonth, referenceDate);
  const deliveredOrders = periodOrders.filter((order) => order.status === "delivered");
  const pendingOrders = periodOrders.filter((order) => order.status === "pending");
  const transferredOrders = periodOrders.filter((order) => order.status === "transferred");

  return {
    periodLabel: getPeriodLabel(preset, pickedMonth, referenceDate),
    deliveredRevenue: deliveredOrders.reduce((sum, order) => sum + order.total, 0),
    deliveredCount: deliveredOrders.length,
    pendingCount: pendingOrders.length,
    transferredCount: transferredOrders.length,
    needsActionCount: pendingOrders.length + transferredOrders.length,
  };
}
