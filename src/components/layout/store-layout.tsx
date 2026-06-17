"use client";

import { Suspense } from "react";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartStockSync } from "@/components/cart/cart-stock-sync";
import { CartDrawerProvider } from "@/providers/cart-drawer-provider";
import { ModelFilterDrawerProvider } from "@/providers/model-filter-drawer-provider";
import { ProductPreviewProvider } from "@/providers/product-preview-provider";

import { Footer } from "./footer";
import { Header } from "./header";
import { ModelFilterDrawer } from "./model-filter-drawer";

type StoreLayoutProps = {
  children: React.ReactNode;
};

export function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <ModelFilterDrawerProvider>
      <CartDrawerProvider>
        <ProductPreviewProvider>
          <div className="flex min-h-dvh w-full flex-1 flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Suspense fallback={null}>
            <ModelFilterDrawer />
          </Suspense>
          <CartDrawer />
          <CartStockSync />
        </ProductPreviewProvider>
      </CartDrawerProvider>
    </ModelFilterDrawerProvider>
  );
}
