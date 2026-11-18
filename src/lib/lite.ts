import data from "@/data/lite.json";

/**
 * Slim product record for client components: s slug, n name, p price, o price before discount, k stock, t thumbnail
 * (null = no photo), b brand, z options [key, values], v variants [combination, stock] (0 = none).
 */
export type Lite = { s: string; n: string; p: number; o: number | null; k: number | null; t: string | null; b: string; z: ["model" | "colour", string[]][]; v: 0 | [string, number | null][] };

export const liteProducts = data as Lite[];
const bySlug = new Map(liteProducts.map((p) => [p.s, p]));

export const getLite = (slug: string) => bySlug.get(slug);

/** Same rules as the server's resolveLine: every option chosen, the combination exists, stock from the variant. */
export function resolveLine(slug: string, opt: string | null) {
  const product = bySlug.get(slug);
  if (!product) return null;
  if (!product.z.length) return opt ? null : { product, opt: null, price: product.p, stock: product.k };
  const vals = (opt ?? "").split(" / ");
  if (vals.length !== product.z.length || product.z.some(([, values], i) => !values.includes(vals[i]))) return null;
  const variant = product.v ? product.v.find(([key]) => key === opt) : undefined;
  if (product.v && !variant) return null;
  return { product, opt: opt!, price: product.p, stock: variant ? variant[1] : product.k };
}

/** Stock of a full option combination, or null when not tracked per combination. */
export const comboStock = (p: Lite, opt: string) => (p.v ? (p.v.find(([key]) => key === opt)?.[1] ?? 0) : p.k);
