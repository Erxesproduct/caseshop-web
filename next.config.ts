import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// Old Zochil URLs keep working: /products/<categoryId|null>/<productId> → /p/<slug>, /products/<categoryId> → /shop?….
const catalog = JSON.parse(readFileSync(path.join(process.cwd(), "src", "data", "catalog.json"), "utf8")) as { products: { id: number; slug: string }[] };
const productRedirects = catalog.products.map((p) => ({ source: `/products/:category/${p.id}`, destination: `/p/${p.slug}`, permanent: true }));
// Zochil categories of shop 5855 → brand / series filters on the new site
const cats = JSON.parse(readFileSync(path.join(process.cwd(), "src", "data", "catalog.json"), "utf8")) as { models: { id: string; brand: string }[] };
const BRANDS: Record<number, string> = { 187360: "iphone", 187361: "samsung", 187363: "xiaomi", 332229: "huawei", 332628: "honor", 187365: "oppo", 187366: "vivo", 187364: "realme", 187368: "lg", 334918: "sony", 334911: "tecno", 334909: "infinix", 221559: "tablet", 338479: "airpods" };
const categoryRedirects = [
  ...Object.entries(BRANDS).map(([id, b]) => ({ source: `/products/${id}`, destination: `/shop?b=${b}`, permanent: true })),
  ...cats.models.map((m) => ({ source: `/products/${m.id}`, destination: `/shop?b=${m.brand}&m=${m.id}`, permanent: true })),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Photos are pre-sized WebP (440 px thumbs, 900 px large, portrait), so they are served as-is.
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: "/products", destination: "/shop", permanent: true },
      ...productRedirects,
      ...categoryRedirects,
      { source: "/products/:category(\d+|null)", destination: "/shop", permanent: false },
      { source: "/category/:path*", destination: "/shop", permanent: false },
      { source: "/saled-products", destination: "/shop", permanent: true },
      { source: "/brands/:path*", destination: "/shop", permanent: false },
      { source: "/posts/:path*", destination: "/", permanent: false },
      { source: "/shopping-cart", destination: "/cart", permanent: true },
      { source: "/checkout", destination: "/cart", permanent: true },
      { source: "/about", destination: "/info#contact", permanent: true },
      { source: "/faq", destination: "/info#faq", permanent: true },
      { source: "/terms", destination: "/info#payment", permanent: true },
      { source: "/contact", destination: "/info#contact", permanent: true },
      { source: "/accounts/:path*", destination: "/", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      { source: "/images/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
    ];
  },
};

export default nextConfig;
