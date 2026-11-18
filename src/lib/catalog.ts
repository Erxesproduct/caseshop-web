import data from "@/data/catalog.json";

export type Img = { src: string; w: number; h: number };
export type Photo = Img & { thumb: Img };
export type Block = { t: "p" | "li"; x: string };
export type Option = { key: "model" | "colour"; label: string; values: string[] };

export type Product = {
  /** Zochil product id (erxes code CS-<id>, old-URL redirects). */
  id: number;
  slug: string;
  name: string;
  /** Zochil short description: an English name («Honor 20 Smoke Case») or a short Mongolian note. */
  subtitle: string | null;
  english: boolean;
  /** Zochil top category = phone brand. */
  brand: string;
  /** Zochil sub-categories = phone series the case fits (ids). */
  models: string[];
  features: string[];
  /** Choices on Zochil: colour / print, and for some cases which phone it is for. */
  options: Option[];
  /** Per-combination stock (8 products on Zochil): key = values in option order joined by « / ». */
  variants: { key: string; stock: number | null }[] | null;
  price: number;
  compareAt: number | null;
  stock: number | null;
  bestseller: boolean;
  createdAt: string;
  details: Block[];
  images: Photo[];
};

export type Brand = { id: string; name: string; count: number };
export type Model = { id: string; name: string; brand: string; ordering: number; count: number };
export type Feature = { id: string; name: string; count: number };

export const products = data.products as Product[];
export const brands = data.brands as Brand[];
export const models = data.models as Model[];
export const features = data.features as Feature[];
export const excluded = data.excluded as { id: number; name: string; price: number }[];
export const faq = data.faq as { q: string; a: string }[];
export const banners = data.banners as (Img & { href: string | null })[];
export const catalogUpdatedAt = data.updatedAt;

const bySlug = new Map(products.map((p) => [p.slug, p]));
export const getProduct = (slug: string) => bySlug.get(slug);
export const getBrand = (id: string) => brands.find((b) => b.id === id);
export const getModel = (id: string) => models.find((m) => m.id === id);
export const getFeature = (id: string) => features.find((f) => f.id === id);
export const brandName = (id: string) => getBrand(id)?.name ?? "Бусад";

export const soldOut = (p: { stock: number | null }) => p.stock === 0;
export const onSale = (p: Pick<Product, "price" | "compareAt">) => p.compareAt != null && p.compareAt > p.price;
export const inStock = products.filter((p) => !soldOut(p));

/** erxes product code: CS-<zochil id>. */
export const sku = (p: Pick<Product, "id">) => `CS-${p.id}`;

/** The product a cart line points at (server side). `opt` = chosen values in option order joined by « / ». */
export function resolveLine(slug: string, opt: string | null) {
  const product = getProduct(slug);
  if (!product) return null;
  if (!product.options.length) return opt ? null : { product, opt: null, price: product.price, stock: product.stock };
  const vals = (opt ?? "").split(" / ");
  if (vals.length !== product.options.length || product.options.some((o, i) => !o.values.includes(vals[i]))) return null;
  const variant = product.variants?.find((v) => v.key === opt);
  if (product.variants && !variant) return null;
  return { product, opt: opt!, price: product.price, stock: variant ? variant.stock : product.stock };
}
