import { redirect } from "next/navigation";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ orderId?: string; emailSent?: string; email?: string }>;
};

/** Legacy URL — redirects to unified track order page with one-time confirmation banner. */
export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { orderId, emailSent, email } = await searchParams;
  const id = orderId?.trim();

  if (!id) {
    redirect("/shop");
  }

  const params = new URLSearchParams({
    orderId: id,
    placed: "1",
  });

  if (emailSent === "1" || email === "pending") {
    params.set("email", "pending");
  }

  redirect(`/track-order?${params.toString()}`);
}
