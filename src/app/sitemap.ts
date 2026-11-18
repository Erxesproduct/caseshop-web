import type { MetadataRoute } from "next";
import { brands, catalogUpdatedAt, models, products } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(catalogUpdatedAt);
  return [
    { url: absoluteUrl("/"), lastModified, priority: 1 },
    { url: absoluteUrl("/shop"), lastModified, priority: 0.8 },
    ...brands.map((b) => ({ url: absoluteUrl(`/shop?b=${b.id}`), lastModified, priority: 0.8 })),
    ...models.map((m) => ({ url: absoluteUrl(`/shop?b=${m.brand}&m=${m.id}`), lastModified, priority: 0.6 })),
    ...products.map((p) => ({ url: absoluteUrl(`/p/${p.slug}`), lastModified, priority: 0.7 })),
    { url: absoluteUrl("/info"), lastModified, priority: 0.5 },
  ];
}
