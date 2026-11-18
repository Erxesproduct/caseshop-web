import Image from "next/image";
import Link from "next/link";
import { HeroDeck } from "@/components/hero-deck";
import { ArrowIcon, ClockIcon, DeviceIcon, MagnetIcon, PinIcon, TruckIcon } from "@/components/icons";
import { PhoneFinder } from "@/components/phone-finder";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Scroller } from "@/components/scroller";
import { business, storeMap } from "@/content/business";
import { banners, brands, features, inStock, models, products, type Product } from "@/lib/catalog";
import { countLabel, formatPrice } from "@/lib/format";

const withPhoto = inStock.filter((p) => p.images.length);
const newest = [...withPhoto].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
const best = withPhoto.filter((p) => p.bestseller);
const deck = banners.filter((b) => b.h > b.w);
const PRICES = [5000, 10000, 15000, 20000, 25000, 30000];

const VIBES: { id: string; title: string; line: string; bg: string; fg: string }[] = [
  { id: "magsafe", title: "MagSafe", line: "Соронзон цэнэглэгч, тогтоогчтой", bg: "#162a4a", fg: "#fff" },
  { id: "cute", title: "Хөөрхөн", line: "Зүрх, цэцэг, баавгай, хээ", bg: "#ff4f9a", fg: "#fff" },
  { id: "clear", title: "Тунгалаг", line: "Утасныхаа өнгийг харуул", bg: "#4cb2ff", fg: "#fff" },
  { id: "wallet", title: "Карттай", line: "Хавтас, карт, халаас", bg: "#ffd23f", fg: "#162a4a" },
  { id: "tough", title: "Хамгаалалт", line: "Уналт, доргионоос", bg: "#c6f23a", fg: "#162a4a" },
  { id: "leather", title: "Арьсан", line: "Тансаг, ширэн", bg: "#8a5a3c", fg: "#fff" },
];
const cover = (f: string) => newest.find((p) => p.features.includes(f) && p.features.length < 4) ?? newest.find((p) => p.features.includes(f));

function Shelf({ id, kicker, title, href, list }: { id: string; kicker: string; title: React.ReactNode; href: string; list: Product[] }) {
  if (!list.length) return null;
  return (
    <section className="wrap mt-24 md:mt-28" aria-labelledby={id}>
      <Reveal className="flex items-end justify-between gap-4">
        <div>
          <p className="kicker text-bubble">{kicker}</p>
          <h2 id={id} className="display mt-1 text-[38px] md:text-[54px]">
            {title}
          </h2>
        </div>
        <Link href={href} className="btn btn-glass hidden h-11 min-h-0 shrink-0 px-5 text-[14px] sm:inline-flex">
          Бүгдийг үзэх <ArrowIcon size={16} />
        </Link>
      </Reveal>
      <Scroller className="scroller mt-6">
        {list.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </Scroller>
    </section>
  );
}

export default function Home() {
  const magsafe = products.filter((p) => p.features.includes("magsafe")).length;
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden">
        <span className="blob top-10 -left-24 h-80 w-80 bg-bubble/60" aria-hidden />
        <span className="blob top-40 right-0 h-96 w-96 bg-sky/60" aria-hidden />
        <span className="blob -bottom-20 left-1/3 h-72 w-72 bg-lime/70" aria-hidden />
        <div className="wrap relative grid items-center gap-16 pt-10 pb-20 md:pt-16 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-extrabold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-lime ring-4 ring-lime/30" /> Сандэй плаза · өдөртөө хүргэнэ
            </p>
            <h1 className="display mt-6 text-[54px] sm:text-[76px] lg:text-[92px]">
              Утсандаа <span className="relative inline-block text-bubble">вайб<span className="absolute -right-6 -top-3 text-[0.45em] text-sky">✦</span></span>
              <br />
              өмсгө.
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-2">
              {countLabel(products.length, "гэр")}: MagSafe, тунгалаг, зурагтай, карттай, арьсан. iPhone 18-аас Samsung, Xiaomi, Huawei, Honor, Oppo, Vivo хүртэл. Утсаа сонгоод л таарах гэрээ хар.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#finder" className="btn btn-ink h-14 px-7 text-[17px]">
                <DeviceIcon size={20} /> Утсаа сонго
              </a>
              <Link href="/shop?f=magsafe" className="btn btn-glass h-14 px-6">
                <MagnetIcon size={18} /> MagSafe ({magsafe})
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[
                [formatPrice(5000), "-аас эхэлнэ"],
                ["12:00", "хүртэл захиалбал өдөртөө"],
                [formatPrice(business.freeFrom), "-өөс хүргэлт үнэгүй"],
              ].map(([a, b], i) => (
                <div key={a} className="glass rounded-3xl px-4 py-3" style={{ rotate: `${[-2, 1.5, -1][i]}deg` }}>
                  <dt className="display text-[22px]">{a}</dt>
                  <dd className="text-[12px] leading-snug text-ink-2">{b}</dd>
                </div>
              ))}
            </dl>
          </div>
          {deck.length > 0 && <HeroDeck banners={deck} />}
        </div>
      </section>

      {/* phone finder */}
      <section id="finder" className="wrap scroll-mt-32" aria-label="Утсаа сонго">
        <Reveal>
          <PhoneFinder brands={brands} models={models} />
        </Reveal>
      </section>

      {/* vibes */}
      <section className="wrap mt-24 md:mt-28" aria-labelledby="vibes">
        <Reveal>
          <p className="kicker text-bubble">Ямар вайб?</p>
          <h2 id="vibes" className="display mt-1 text-[38px] md:text-[54px]">
            Төрлөөрөө сонго
          </h2>
        </Reveal>
        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {VIBES.map((v, i) => {
            const c = cover(v.id);
            const n = features.find((f) => f.id === v.id)?.count ?? 0;
            return (
              <Reveal as="li" key={v.id} delay={(i % 3) * 70}>
                <Link href={`/shop?f=${v.id}`} className="group relative flex h-full min-h-[190px] overflow-hidden rounded-[30px] p-5 transition hover:-translate-y-1 md:min-h-[240px] md:p-7" style={{ background: v.bg, color: v.fg }}>
                  <span className="relative z-10 flex flex-col">
                    <span className="display text-[28px] md:text-[40px]">{v.title}</span>
                    <span className="mt-1 max-w-[12rem] text-[13px] leading-snug opacity-80 md:text-[14px]">{v.line}</span>
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[13px] font-extrabold">
                      {countLabel(n, "гэр")} <ArrowIcon size={15} className="transition group-hover:translate-x-1" />
                    </span>
                  </span>
                  {c && (
                    <span className="phone absolute -right-6 -bottom-8 aspect-[3/4] w-[46%] rotate-12 border-4 border-white/80 transition duration-500 group-hover:rotate-6 md:-right-4 md:w-[40%]">
                      <Image src={c.images[0].thumb.src} alt="" fill sizes="200px" className="object-cover" />
                    </span>
                  )}
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <Shelf id="new" kicker="Шинээр ирсэн" title="Шинэ гэрүүд" href="/shop?sort=new" list={newest.slice(0, 14)} />

      {/* price wall */}
      <section className="wrap mt-24 md:mt-28" aria-labelledby="prices">
        <Reveal className="glass relative overflow-hidden rounded-[36px] p-6 md:p-10">
          <span className="blob -top-16 right-10 h-56 w-56 bg-lilac" aria-hidden />
          <p className="kicker relative text-bubble">Төсөвтөө тааруул</p>
          <h2 id="prices" className="display relative mt-1 text-[38px] md:text-[54px]">
            Үнээр нь
          </h2>
          <div className="relative mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {PRICES.map((v, i) => {
              const n = products.filter((p) => p.price === v).length;
              return (
                <Link key={v} href={`/shop?p=${v}`} className="group rounded-3xl bg-white p-4 text-center transition hover:-translate-y-1 hover:bg-ink hover:text-white" style={{ rotate: `${[-2, 1, -1, 2, -1.5, 1][i]}deg` }}>
                  <span className="display block text-[26px]">{formatPrice(v)}</span>
                  <span className="text-[12.5px] font-bold opacity-60">{countLabel(n, "гэр")}</span>
                </Link>
              );
            })}
          </div>
        </Reveal>
      </section>

      <Shelf id="best" kicker="Дэлгүүрийн онцлох" title="Их зарагддаг" href="/shop?sort=best" list={best} />
      <Shelf id="android" kicker="Samsung · Xiaomi · Huawei · Honor" title="Android утсанд" href="/shop?b=samsung" list={newest.filter((p) => p.brand !== "iphone").slice(0, 14)} />

      {/* brands */}
      <section className="wrap mt-24 md:mt-28" aria-labelledby="brands">
        <Reveal>
          <p className="kicker text-bubble">14 брэнд</p>
          <h2 id="brands" className="display mt-1 text-[38px] md:text-[54px]">
            Брэндээр
          </h2>
        </Reveal>
        <div className="mt-7 flex flex-wrap gap-2.5">
          {brands.map((b) => (
            <Link key={b.id} href={`/shop?b=${b.id}`} className="glass group flex items-baseline gap-2 rounded-full px-5 py-3 transition hover:-translate-y-0.5 hover:bg-ink hover:text-white">
              <span className="display text-[22px] md:text-[26px]">{b.name}</span>
              <span className="text-[13px] font-bold opacity-50">{b.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* delivery + store */}
      <section className="wrap mt-24 grid gap-4 md:mt-28 md:grid-cols-3" aria-label="Хүргэлт ба дэлгүүр">
        <Reveal className="rounded-[30px] bg-ink p-7 text-white">
          <ClockIcon size={30} className="text-lime" />
          <p className="display mt-4 text-[34px]">Өдөртөө</p>
          <p className="mt-2 text-[14.5px] text-white/75">{business.rules.delivery}</p>
        </Reveal>
        <Reveal delay={70} className="rounded-[30px] bg-bubble p-7 text-white">
          <TruckIcon size={30} />
          <p className="display mt-4 text-[34px]">{formatPrice(business.cityFee)}</p>
          <p className="mt-2 text-[14.5px] text-white/85">{business.rules.deliveryMin} Орон нутагт унаанд хийж өгнө.</p>
        </Reveal>
        <Reveal delay={140}>
          <a href={storeMap} target="_blank" rel="noreferrer" className="glass flex h-full flex-col rounded-[30px] p-7 transition hover:-translate-y-1">
            <PinIcon size={30} className="text-sky" />
            <p className="display mt-4 text-[34px]">Сандэй плаза</p>
            <p className="mt-2 text-[14.5px] text-ink-2">{business.address}. Ирж утсандаа тааруулж үзээрэй.</p>
            <span className="mt-auto pt-4 text-[13px] font-extrabold text-sky">Газрын зураг →</span>
          </a>
        </Reveal>
      </section>
    </>
  );
}
