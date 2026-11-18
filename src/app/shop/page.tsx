import type { Metadata } from "next";
import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { brandName, brands, features, getBrand, getFeature, getModel, models, products, soldOut, type Product } from "@/lib/catalog";
import { countLabel, formatPrice } from "@/lib/format";

type Search = { q?: string; b?: string; m?: string; f?: string; p?: string; sort?: string; all?: string; page?: string };
const PER_PAGE = 48;
const PRICES = [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000];

function heading(s: Search) {
  const m = getModel(s.m ?? "");
  const b = getBrand(s.b ?? "");
  const f = getFeature(s.f ?? "");
  if (s.q) return `«${s.q.slice(0, 60)}»`;
  const parts = [m ? m.name : b?.name, f?.name, s.p && `${formatPrice(Number(s.p))}-ийн`].filter(Boolean) as string[];
  return parts.length ? parts.join(" · ") : "Бүх гэр";
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Search> }): Promise<Metadata> {
  const s = await searchParams;
  return { title: `${heading(s)} гэр`, alternates: { canonical: "/shop" }, robots: s.q || s.page || s.p ? { index: false } : undefined };
}

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
const compact = (s: string) => s.replace(/\s+/g, "");
const haystack = new Map(
  products.map((p) => {
    const text = norm([p.name, p.subtitle, brandName(p.brand), ...p.models.map((m) => getModel(m)?.name), ...p.options.flatMap((o) => o.values), ...p.features.map((f) => getFeature(f)?.name)].filter(Boolean).join(" "));
    return [p.id, `${text} ${compact(text)}`];
  }),
);

export default async function ShopPage({ searchParams }: { searchParams: Promise<Search> }) {
  const s = await searchParams;
  const q = (s.q ?? "").slice(0, 60);
  const brand = getBrand(s.b ?? "");
  const model = getModel(s.m ?? "");
  const feat = getFeature(s.f ?? "");
  const price = PRICES.includes(Number(s.p)) ? Number(s.p) : null;
  const showAll = s.all === "1";
  const sort = s.sort === "cheap" || s.sort === "dear" || s.sort === "new" || s.sort === "best" ? s.sort : "default";

  const words = norm(q).split(" ").filter(Boolean);
  const base = (p: Product) => (!brand || p.brand === brand.id) && (!model || p.models.includes(model.id)) && words.every((w) => haystack.get(p.id)!.includes(w));
  const pool = products.filter(base);
  const match = (p: Product) => (!feat || p.features.includes(feat.id)) && (!price || p.price === price);
  let list = pool.filter((p) => match(p) && (showAll || !soldOut(p)));
  if (sort === "cheap") list = [...list].sort((a, b) => a.price - b.price);
  else if (sort === "dear") list = [...list].sort((a, b) => b.price - a.price);
  else if (sort === "best") list = [...list].sort((a, b) => Number(b.bestseller) - Number(a.bestseller));
  else list = [...list].sort((a, b) => Number(!a.images.length) - Number(!b.images.length) || b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
  const hidden = showAll ? 0 : pool.filter((p) => match(p) && soldOut(p)).length;

  const brandModels = brand ? models.filter((m) => m.brand === brand.id) : [];
  const featList = features.filter((f) => pool.some((p) => p.features.includes(f.id)));
  const priceList = PRICES.filter((v) => pool.some((p) => p.price === v));

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(s.page) || 1));
  const shown = list.slice(0, page * PER_PAGE);

  const href = (patch: Partial<Search>) => {
    const next = { ...s, ...patch };
    if (!("page" in patch)) delete next.page;
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <div className="wrap pt-8 md:pt-12">
      <p className="kicker text-bubble">{q ? "Хайлтын үр дүн" : model ? `${brand?.name ?? brandName(model.brand)}-д таарах` : "CASESHOP.MN"}</p>
      <h1 className="display mt-1 text-[44px] md:text-[72px]">{heading(s)}</h1>

      <form action="/shop" role="search" className="relative mt-6 max-w-xl">
        {brand && <input type="hidden" name="b" value={brand.id} />}
        {model && <input type="hidden" name="m" value={model.id} />}
        <SearchIcon size={19} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-mute" />
        <input name="q" type="search" defaultValue={q} placeholder="17 Pro Max, A55, тунгалаг…" aria-label="Хайх" className="h-14 w-full rounded-full border border-white bg-white/85 pr-28 pl-11 text-[16px] shadow-[0_10px_30px_-18px_rgb(22_42_74/0.4)] outline-none focus:border-ink" />
        <button className="btn btn-ink absolute top-1/2 right-1.5 h-11 min-h-0 -translate-y-1/2 px-5 text-[14px]">Хайх</button>
      </form>

      <nav className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0" aria-label="Брэнд">
        <Link href={href({ b: undefined, m: undefined })} className="chip" aria-current={!brand && !model}>
          Бүх брэнд
        </Link>
        {brands.map((b) => (
          <Link key={b.id} href={href({ b: b.id, m: undefined })} className="chip" aria-current={brand?.id === b.id}>
            {b.name} <span className="text-[12px] opacity-50">{b.count}</span>
          </Link>
        ))}
      </nav>
      {brandModels.length > 0 && (
        <nav className="glass mt-3 flex flex-wrap gap-1.5 rounded-3xl p-3" aria-label="Загвар">
          <Link href={href({ m: undefined })} className="chip min-h-8 px-3 text-[13px]" aria-current={!model}>
            Бүх {brand!.name}
          </Link>
          {brandModels.map((m) => (
            <Link key={m.id} href={href({ m: m.id })} className="chip min-h-8 px-3 text-[13px]" aria-current={model?.id === m.id}>
              {m.name} <span className="opacity-50">{m.count}</span>
            </Link>
          ))}
        </nav>
      )}
      <div className="-mx-4 mt-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0" aria-label="Төрөл, үнэ">
        {featList.map((f) => (
          <Link key={f.id} href={href({ f: feat?.id === f.id ? undefined : f.id })} className="chip min-h-8 px-3 text-[13px]" aria-current={feat?.id === f.id}>
            {f.name}
          </Link>
        ))}
        {priceList.length > 1 && <span className="mx-1 h-6 w-px shrink-0 bg-line" aria-hidden />}
        {priceList.length > 1 &&
          priceList.map((v) => (
            <Link key={v} href={href({ p: price === v ? undefined : String(v) })} className="chip min-h-8 px-3 text-[13px]" aria-current={price === v}>
              {formatPrice(v)}
            </Link>
          ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[14px]">
        <p className="font-bold">
          {countLabel(list.length, "гэр")}
          {hidden > 0 && (
            <>
              {" · "}
              <Link href={href({ all: "1" })} className="text-bubble underline underline-offset-2">
                дууссан {hidden}-г харуулах
              </Link>
            </>
          )}
          {showAll && (
            <>
              {" · "}
              <Link href={href({ all: undefined })} className="text-bubble underline underline-offset-2">
                зөвхөн бэлэн байгаа
              </Link>
            </>
          )}
        </p>
        <div className="flex flex-wrap gap-1.5" aria-label="Эрэмбэ">
          {(
            [
              ["default", "Шинэ нь эхэнд"],
              ["best", "Их зарагддаг"],
              ["cheap", "Хямд нь эхэнд"],
              ["dear", "Үнэтэй нь эхэнд"],
            ] as const
          ).map(([id, label]) => (
            <Link key={id} href={href({ sort: id === "default" ? undefined : id })} className="chip min-h-8 px-3 text-[13px]" aria-current={sort === id}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {shown.length ? (
        <ul className="mt-7 grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((p, i) => (
            <li key={p.id}>
              <ProductCard p={p} priority={i < 5} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card mx-auto mt-10 max-w-md p-8 text-center">
          <p className="display text-[34px]">Олдсонгүй</p>
          <p className="mt-1 text-ink-2">Таны утсанд таарах гэр дэлгүүрт байж магадгүй: утсаар эсвэл Facebook чатаар асуугаарай.</p>
          <Link href="/shop" className="btn btn-ink mt-5">
            Бүх гэр
          </Link>
        </div>
      )}

      {page < pages && (
        <div className="mt-12 text-center">
          <Link href={href({ page: String(page + 1) })} scroll={false} className="btn btn-glass h-14 px-8">
            Цааш үзэх ({list.length - shown.length})
          </Link>
        </div>
      )}
    </div>
  );
}
