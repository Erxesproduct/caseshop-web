import Image from "next/image";
import Link from "next/link";
import { business, storeMap } from "@/content/business";
import { formatPrice } from "@/lib/format";
import { NAV } from "./header";
import { ClockIcon, FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, TiktokIcon, YoutubeIcon } from "./icons";

const SOCIAL = [
  [business.facebook, "Facebook", FacebookIcon],
  [business.instagram, "Instagram", InstagramIcon],
  [business.tiktok, "TikTok", TiktokIcon],
  [business.youtube, "YouTube", YoutubeIcon],
] as const;

export function Footer() {
  return (
    <footer className="relative mt-28 overflow-hidden bg-ink text-white">
      <span className="blob -top-24 -left-20 h-72 w-72 bg-bubble" aria-hidden />
      <span className="blob -right-16 bottom-0 h-80 w-80 bg-sky" aria-hidden />
      <div className="wrap relative grid gap-12 py-16 md:grid-cols-[1fr_0.6fr_1.4fr]">
        <div>
          <Image src="/brand/logo-white.png" alt="CASESHOP.MN" width={190} height={34} className="h-7 w-auto" />
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/70">{business.about} Утсандаа таарах гэрээ олоод, өдөртөө аваарай.</p>
          <div className="mt-6 flex gap-2">
            {SOCIAL.map(([href, label, Icon]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 transition hover:-translate-y-1 hover:bg-bubble">
                <Icon size={19} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="kicker text-[12px] text-white/50">Дэлгүүр</p>
          <ul className="mt-4 grid gap-2 text-[15px] font-bold">
            {NAV.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-lime">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid content-start gap-3 sm:grid-cols-2">
          <a href={`tel:${business.phone.tel}`} className="group flex items-center gap-4 rounded-3xl bg-white/[.07] p-4 ring-1 ring-white/10 transition hover:bg-white/[.12] sm:col-span-2">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lime text-ink transition group-hover:rotate-12">
              <PhoneIcon size={21} />
            </span>
            <span>
              <span className="block text-[12px] font-bold tracking-widest text-white/50 uppercase">Утас</span>
              <span className="display block text-[30px] leading-none">{business.phone.display}</span>
            </span>
          </a>
          <a href={storeMap} target="_blank" rel="noreferrer" className="group flex gap-3 rounded-3xl bg-white/[.07] p-4 ring-1 ring-white/10 transition hover:bg-white/[.12]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-bubble">
              <PinIcon size={18} />
            </span>
            <span className="text-[13.5px] leading-snug">
              <span className="block font-extrabold">Сандэй плаза, 1042 тоот</span>
              <span className="text-white/60">Баянзүрх дүүрэг, 13-р хороолол</span>
            </span>
          </a>
          <a href={`mailto:${business.email}`} className="group flex gap-3 rounded-3xl bg-white/[.07] p-4 ring-1 ring-white/10 transition hover:bg-white/[.12]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky">
              <MailIcon size={18} />
            </span>
            <span className="min-w-0 text-[13.5px] leading-snug">
              <span className="block font-extrabold">Имэйл</span>
              <span className="block truncate text-white/60">{business.email}</span>
            </span>
          </a>
          <p className="flex items-center gap-2.5 rounded-3xl bg-white/[.07] px-4 py-3 text-[13px] text-white/75 ring-1 ring-white/10 sm:col-span-2">
            <ClockIcon size={18} className="shrink-0 text-lime" />
            12:00-оос өмнө захиалбал өдөртөө · хүргэлт {formatPrice(business.cityFee)}, {formatPrice(business.freeFrom)}-өөс дээш үнэгүй
          </p>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <p className="wrap py-5 text-[12.5px] text-white/45">© {new Date().getFullYear()} CASESHOP MONGOLIA · caseshop.mn</p>
      </div>
    </footer>
  );
}
