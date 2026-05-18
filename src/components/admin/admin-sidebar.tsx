"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { env } from "@/lib/env";

const navItems = [
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-muted/20 bg-surface lg:w-56 lg:border-b-0 lg:border-r">
      <div className="border-b border-muted/20 px-4 py-5">
        <Link href="/admin/products" className="flex items-center gap-2 font-semibold text-foreground">
          <LayoutGrid className="h-5 w-5 text-accent" />
          <span>{env.storeName} Admin</span>
        </Link>
      </div>

      <nav className="flex gap-1 p-3 lg:flex-col">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-white"
                  : "text-foreground hover:bg-background",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
