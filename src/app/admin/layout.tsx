import type { Metadata } from "next";

import { AdminGuard } from "@/components/admin/admin-guard";
import { NOINDEX_ROBOTS } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Admin",
  robots: NOINDEX_ROBOTS,
};

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminGuard>{children}</AdminGuard>;
}
