import type { Metadata } from "next";
import Image from "next/image";
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, TiktokIcon, YoutubeIcon } from "@/components/icons";
import { business, storeMap } from "@/content/business";
import { banners, faq } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Хүргэлт, төлбөр, холбоо барих",
  description: "CASESHOP MONGOLIA: хүргэлт (5,000₮, 30,000₮-өөс үнэгүй, өдөртөө), төлбөр (QPay, Хаан банк), Сандэй плаза 1042, түгээмэл асуулт.",
  alternates: { canonical: "/info" },
};

const wide = banners.find((b) => b.w > b.h);

function H2({ id, n, c, children }: { id: string; n: number; c: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex scroll-mt-40 items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-2xl font-display text-[18px] font-black" style={{ background: c, color: c === "#c6f23a" || c === "#ffd23f" ? "#162a4a" : "#fff" }}>
        {n}
      </span>
      <span className="display text-[34px] md:text-[46px]">{children}</span>
    </h2>
  );
}

export default function InfoPage() {
  return (
    <div className="wrap pt-8 md:pt-12">
      <p className="kicker text-bubble">{business.name}</p>
      <h1 className="display mt-1 text-[48px] md:text-[80px]">Мэдээлэл</h1>
      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Хэсгүүд">
        {[
          ["#delivery", "Хүргэлт"],
          ["#payment", "Төлбөр"],
          ["#faq", "Асуулт"],
          ["#contact", "Холбоо барих"],
        ].map(([h, t]) => (
          <a key={h} href={h} className="chip">
            {t}
          </a>
        ))}
      </nav>

      <section className="mt-14" aria-labelledby="delivery">
        <H2 id="delivery" n={1} c="#ff4f9a">
          Хүргэлт
        </H2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] bg-ink p-6 text-white">
            <p className="kicker text-[12px] text-white/60">Улаанбаатар</p>
            <p className="display mt-2 text-[44px]">{formatPrice(business.cityFee)}</p>
            <p className="mt-2 text-[14px] text-white/75">{formatPrice(business.freeFrom)}-өөс дээш захиалгад үнэгүй. Хүргэлт {formatPrice(business.deliveryMin)}-өөс дээш захиалгад.</p>
          </div>
          <div className="card p-6">
            <p className="kicker text-[12px] text-mute">Орон нутаг</p>
            <p className="display mt-2 text-[34px]">Унаагаар</p>
            <p className="mt-2 text-[14px] text-ink-2">Орон нутгийн унаанд хийж өгнө. Унааны төлбөрийг холбогдож мэдэгдэнэ.</p>
          </div>
          <div className="card p-6">
            <p className="kicker text-[12px] text-mute">Дэлгүүрээс</p>
            <p className="display mt-2 text-[34px]">Сандэй плаза</p>
            <p className="mt-2 text-[14px] text-ink-2">{business.address}. Хүргэлтийн доод дүн шаардлагагүй.</p>
          </div>
        </div>
        <ul className="prose-case mt-6 max-w-3xl">
          <li>{business.rules.delivery}</li>
          <li>Захиалгын доод дүн {formatPrice(business.minOrder)}.</li>
        </ul>
      </section>

      <section className="mt-20" aria-labelledby="payment">
        <H2 id="payment" n={2} c="#4cb2ff">
          Төлбөр
        </H2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {business.payments.map((m) => (
            <div key={m.id} className="card p-6">
              <p className="display text-[30px]">{m.name}</p>
              <p className="mt-1 text-ink-2">{m.note}</p>
            </div>
          ))}
        </div>
        <ul className="prose-case mt-6 max-w-3xl">
          <li>{business.rules.transfer}</li>
          <li>{business.rules.ebarimt}</li>
          <li>{business.rules.wholesale}</li>
        </ul>
      </section>

      {faq.length > 0 && (
        <section className="mt-20" aria-labelledby="faq">
          <H2 id="faq" n={3} c="#c6f23a">
            Түгээмэл асуулт
          </H2>
          <div className="mt-6 grid max-w-3xl gap-3">
            {faq.map((f) => (
              <details key={f.q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-extrabold">
                  {f.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cloud text-[18px] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-ink-2">{f.a}</p>
              </details>
            ))}
            <p className="text-[13px] text-mute">Хүргэлтийн нөхцөл дээрх «Хүргэлт» хэсэгт байгаа нь хамгийн сүүлийн журам.</p>
          </div>
        </section>
      )}

      <section className="mt-20" aria-labelledby="contact">
        <H2 id="contact" n={4} c="#b39bff">
          Холбоо барих
        </H2>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div className="grid content-start gap-3 sm:grid-cols-2">
            <a href={`tel:${business.phone.tel}`} className="card flex items-center gap-4 p-5 transition hover:-translate-y-1 sm:col-span-2">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lime text-ink">
                <PhoneIcon size={22} />
              </span>
              <span className="display text-[30px]">{business.phone.display}</span>
            </a>
            <a href={storeMap} target="_blank" rel="noreferrer" className="card flex gap-3 p-5 transition hover:-translate-y-1">
              <PinIcon size={22} className="shrink-0 text-bubble" />
              <span className="text-[14px] font-bold">{business.address}</span>
            </a>
            <a href={`mailto:${business.email}`} className="card flex gap-3 p-5 transition hover:-translate-y-1">
              <MailIcon size={22} className="shrink-0 text-sky" />
              <span className="min-w-0 truncate text-[14px] font-bold">{business.email}</span>
            </a>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {(
                [
                  [business.facebook, "Facebook", FacebookIcon],
                  [business.instagram, "Instagram", InstagramIcon],
                  [business.tiktok, "TikTok", TiktokIcon],
                  [business.youtube, "YouTube", YoutubeIcon],
                ] as const
              ).map(([href, label, Icon]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="btn btn-glass h-11 min-h-0 px-4 text-[14px]">
                  <Icon size={18} /> {label}
                </a>
              ))}
            </div>
          </div>
          {wide && (
            <div className="card overflow-hidden">
              <Image src={wide.src} alt="CASESHOP: гар утасны гэр, төрөл бүрээр" width={wide.w} height={wide.h} sizes="(min-width: 1024px) 600px, 100vw" className="h-auto w-full" />
            </div>
          )}
        </div>
        <p className="mt-6 max-w-2xl text-[15px] text-ink-2">{business.about}</p>
      </section>
    </div>
  );
}
