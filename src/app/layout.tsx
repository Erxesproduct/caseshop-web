import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { business } from "@/content/business";
import { banners } from "@/lib/catalog";
import { siteUrl } from "@/lib/site-url";
import { display, sans } from "./fonts";
import "./globals.css";

const og = banners[0];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${business.name}: гар утасны гэр, MagSafe кейс`, template: `%s · CASESHOP` },
  description: business.description,
  openGraph: { type: "website", locale: "mn_MN", siteName: business.name, description: business.description, images: og ? [{ url: og.src, width: og.w, height: og.h }] : undefined },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#162a4a" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
          Үндсэн агуулга руу
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
