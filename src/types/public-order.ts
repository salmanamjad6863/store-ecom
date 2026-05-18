import type { OrderItem, OrderStatus } from "@/types/order";

export type PublicOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: "cod";
  items: OrderItem[];
  customer: {
    name: string;
    email?: string;
    phone?: string;
    city: string;
    addressLine1: string;
    postalCode?: string;
  };
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
};
