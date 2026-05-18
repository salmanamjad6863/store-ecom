import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { LayoutSwitcher } from "@/components/layout/layout-switcher";
import { env } from "@/lib/env";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: env.storeName,
  description: `${env.storeName} — shop online with cash on delivery`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <QueryProvider>
          <AuthProvider>
            <LayoutSwitcher>{children}</LayoutSwitcher>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
