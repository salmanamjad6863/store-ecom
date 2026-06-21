import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Great_Vibes, Playfair_Display } from "next/font/google";

import { LayoutSwitcher } from "@/components/layout/layout-switcher";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { STORE_SEO, buildDefaultOpenGraph, getSiteUrl } from "@/lib/seo/site";
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

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: STORE_SEO.name,
    template: `%s | ${STORE_SEO.name}`,
  },
  description: STORE_SEO.defaultDescription,
  openGraph: buildDefaultOpenGraph(STORE_SEO.name, STORE_SEO.defaultDescription),
  twitter: {
    card: "summary_large_image",
    title: STORE_SEO.name,
    description: STORE_SEO.defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable} ${cormorant.variable} ${greatVibes.variable} min-h-dvh antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-background text-foreground">
        <MetaPixel />
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
