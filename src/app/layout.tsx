import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Playfair_Display } from "next/font/google";

import { LayoutSwitcher } from "@/components/layout/layout-switcher";
import { env } from "@/lib/env";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";

import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "500"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: env.storeName,
  description: `${env.storeName} — shop online with cash on delivery.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable} ${cormorant.variable} min-h-dvh antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-background text-foreground">
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <LayoutSwitcher>{children}</LayoutSwitcher>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
