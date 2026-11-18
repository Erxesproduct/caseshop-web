import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/buy-box";
import { Gallery } from "@/components/gallery";
import { ChatIcon, DeviceIcon, TruckIcon } from "@/components/icons";
import { Price } from "@/components/price";
import { ProductCard } from "@/components/product-card";
import { Scroller } from "@/components/scroller";
import { business } from "@/content/business";
import { brandName, getFeature, getModel, getProduct, inStock, products, sku, soldOut } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { absoluteUrl } from "@/lib/site-url";

export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  const description = `${p.name}${p.subtitle ? ` (${p.subtitle})` : ""}: ${formatPrice(p.price)}. ${business.rules.delivery}`;
  const img = p.images[0];
  return { title: p.name, description, alternates: { canonical: `/p/${p.slug}` }, openGraph: { title: p.name, description, images: img ? [{ url: img.src, width: img.w, height: img.h }] : undefined } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const out = soldOut(p);
  const fits = p.models.map(getModel).filter((m) => m != null);
  const related = inStock
    .filter((x) => x.id !== p.id && x.images.length && (p.models.length ? x.models.some((m) => p.models.includes(m)) : x.brand === p.brand))
    .sort((a, b) => b.features.filter((f) => p.features.includes(f)).length - a.features.filter((f) => p.features.includes(f)).length || b.id - a.id)
    .slice(0, 12);
  const sameVibe = inStock.filter((x) => x.id !== p.id && x.images.length && p.features[0] && x.features.includes(p.features[0]) && !related.includes(x)).slice(0, 12);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: sku(p),
    image: p.images.map((m) => absoluteUrl(m.src)),
    category: `Гар утасны гэр · ${brandName(p.brand)}`,
    offers: { "@type": "Offer", priceCurrency: "MNT", price: p.price, availability: out ? "https://schema.org/OutOfStock" : "https://schema.org/InStock", url: absoluteUrl(`/p/${p.slug}`) },
  };

  return (
    <div className="wrap pt-6 md:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav className="flex flex-wrap items-center gap-1.5 text-[13px] font-bold text-mute" aria-label="Зам">
        <Link href="/" className="hover:text-bubble">
          Нүүр
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/shop?b=${p.brand}`} className="hover:text-bubble">
          {brandName(p.brand)}
        </Link>
        {fits[0] && (
          <>
            <span aria-hidden>/</span>
            <Link href={`/shop?b=${p.brand}&m=${fits[0].id}`} className="hover:text-bubble">
              {fits[0].name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="relative lg:sticky lg:top-32 lg:self-start">
          {p.images.length ? <Gallery images={p.images} name={p.name} /> : <div className="phone display grid aspect-[3/4] place-items-center text-[48px] text-ink/15">CASE</div>}
        </div>

        <div className="lg:pt-2">
          <div className="flex flex-wrap gap-1.5">
            {p.features.map((f) => (
              <Link key={f} href={`/shop?f=${f}`} className="sticker bg-white text-ink ring-1 ring-line hover:ring-ink">
                {getFeature(f)?.name}
              </Link>
            ))}
          </div>
          <h1 className="display mt-3 text-[36px] md:text-[52px]">{p.name}</h1>
          {p.subtitle && <p className={`mt-2 text-[16px] ${p.english ? "font-bold text-mute" : "text-ink-2"}`}>{p.subtitle}</p>}
          <div className="mt-5">
            <Price price={p.price} compareAt={p.compareAt} size="lg" />
          </div>

          {fits.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 rounded-3xl bg-white/70 p-3">
              <span className="flex items-center gap-1.5 pl-1 text-[13px] font-extrabold">
                <DeviceIcon size={16} /> Таарах утас:
              </span>
              {fits.map((m) => (
                <Link key={m.id} href={`/shop?b=${m.brand}&m=${m.id}`} className="sticker bg-cloud-2 text-ink hover:bg-ink hover:text-white">
                  {m.name}
                </Link>
              ))}
            </div>
          )}

          <div className="card mt-6 p-5 md:p-6">
            <BuyBox slug={p.slug} />
          </div>

          <ul className="mt-5 grid gap-2.5 text-[14.5px]">
            <li className="glass flex gap-3 rounded-3xl p-4">
              <TruckIcon size={22} className="shrink-0 text-bubble" />
              <span>
                <b>{business.rules.delivery}</b> {business.rules.deliveryMin}{" "}
                <Link href="/info#delivery" className="font-bold text-bubble underline underline-offset-2">
                  Дэлгэрэнгүй
                </Link>
              </span>
            </li>
            <li className="glass flex gap-3 rounded-3xl p-4">
              <ChatIcon size={22} className="shrink-0 text-sky" />
              <span>
                Утсандаа таарах эсэхийг асуух бол{" "}
                <a href={business.messenger} target="_blank" rel="noreferrer" className="font-bold text-sky underline underline-offset-2">
                  Facebook чат
                </a>{" "}
                эсвэл{" "}
                <a href={`tel:${business.phone.tel}`} className="font-bold whitespace-nowrap">
                  {business.phone.display}
                </a>
              </span>
            </li>
          </ul>

          {p.details.length > 0 && (
            <section className="prose-case mt-8" aria-label="Тайлбар">
              <h2 className="display text-[22px]">Тайлбар</h2>
              {p.details.map((b, i) => (b.t === "li" ? <li key={i}>{b.x}</li> : <p key={i}>{b.x}</p>))}
            </section>
          )}
          <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 border-t border-line pt-5 text-[13.5px]">
            <dt className="text-mute">Брэнд</dt>
            <dd className="font-bold">{brandName(p.brand)}</dd>
            <dt className="text-mute">Код</dt>
            <dd className="font-bold">{sku(p)}</dd>
            {p.stock != null && p.stock > 0 && p.stock < 5 && (
              <>
                <dt className="text-mute">Үлдэгдэл</dt>
                <dd className="font-bold text-bubble">Цөөхөн үлдсэн ({p.stock})</dd>
              </>
            )}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24" aria-label="Ижил утсанд">
          <p className="kicker text-bubble">{fits[0] ? fits[0].name : brandName(p.brand)}-д таарах</p>
          <h2 className="display mt-1 text-[34px] md:text-[46px]">Өөр гэрүүд</h2>
          <Scroller className="scroller mt-6">
            {related.map((x) => (
              <ProductCard key={x.id} p={x} />
            ))}
          </Scroller>
        </section>
      )}
      {sameVibe.length > 0 && (
        <section className="mt-20" aria-label="Ижил вайб">
          <p className="kicker text-bubble">{getFeature(p.features[0])?.name}</p>
          <h2 className="display mt-1 text-[34px] md:text-[46px]">Ижил вайб</h2>
          <Scroller className="scroller mt-6">
            {sameVibe.map((x) => (
              <ProductCard key={x.id} p={x} />
            ))}
          </Scroller>
        </section>
      )}
    </div>
  );
}
