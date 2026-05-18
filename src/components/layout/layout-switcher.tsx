"use client";

import { usePathname } from "next/navigation";

import { StoreLayout } from "./store-layout";

type LayoutSwitcherProps = {
  children: React.ReactNode;
};

export function LayoutSwitcher({ children }: LayoutSwitcherProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <StoreLayout>{children}</StoreLayout>
    </div>
  );
}
