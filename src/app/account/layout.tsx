import type { Metadata } from "next";

import { NOINDEX_ROBOTS } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Account",
  robots: NOINDEX_ROBOTS,
};

type AccountLayoutProps = {
  children: React.ReactNode;
};

export default function AccountLayout({ children }: AccountLayoutProps) {
  return children;
}
