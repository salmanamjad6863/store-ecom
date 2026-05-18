import { AdminOrderDetail } from "@/components/admin/admin-order-detail";

type AdminOrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params;

  return <AdminOrderDetail orderId={id} />;
}
