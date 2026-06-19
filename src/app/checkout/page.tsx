import type { Metadata } from "next";

import { CheckoutContent } from "@/components/checkout/checkout-content";
import { NOINDEX_ROBOTS } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Checkout",
  robots: NOINDEX_ROBOTS,
};

export default function CheckoutPage() {
  return <CheckoutContent />;
}
