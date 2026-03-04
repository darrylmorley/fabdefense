import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: {
    default: "FAB Defense UK",
    template: "%s | FAB Defense UK",
  },
  description:
    "Official UK retailer for FAB Defense tactical accessories. Premium firearms and airsoft accessories with over 25 years of experience.",
  metadataBase: new URL(
    process.env.PUBLIC_SITE_URL || "https://www.fabdefense.co.uk"
  ),
  openGraph: {
    type: "website",
    siteName: "FAB Defense UK",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
        <script
          defer
          data-domain="fabdefense.co.uk"
          src="https://analytics.shootingsuppliesltd.co.uk/js/script.tagged-events.js"
        />
      </head>
      <body className="bg-content-bg text-content-text font-body min-h-screen flex flex-col antialiased">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
