export const ORDER_STATUSES = ["pending", "transferred", "delivered", "cancelled"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItem = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  unitPrice: number;
  quantity: number;
};

export type OrderCustomer = {
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  city: string;
  postalCode?: string;
  notes?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: "cod";
  items: OrderItem[];
  customer: OrderCustomer;
  userId?: string;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderDocument = Omit<Order, "id" | "createdAt" | "updatedAt"> & {
  createdAt: unknown;
  updatedAt: unknown;
};
