import Image from "next/image";
import Link from "next/link";
import { business } from "@/content/business";
import { products } from "@/lib/catalog";
import { countLabel } from "@/lib/format";
import { CartLink } from "./cart-link";
import { SearchIcon } from "./icons";
import { MyPhonePill } from "./my-phone-pill";
import { Scroller } from "./scroller";

const ticker = [`${countLabel(products.length, "загвар")} гэр`, "12:00-оос өмнө захиалбал өдөртөө", "30,000₮-өөс дээш хүргэлт үнэгүй", "MagSafe · Тунгалаг · Зурагтай · Арьсан", "Сандэй плаза 1042", "QPay · Хаан банк"];

export const NAV = [
  ["/shop?b=iphone", "iPhone"],
  ["/shop?b=samsung", "Samsung"],
  ["/shop?b=xiaomi", "Xiaomi"],
  ["/shop?b=huawei", "Huawei"],
  ["/shop?f=magsafe", "MagSafe"],
  ["/shop", "Бүгд"],
  ["/info", "Мэдээлэл"],
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40">
      <div className="overflow-hidden bg-ink py-1.5 text-white" aria-label="Мэдээлэл">
        <div className="marquee">
          {[0, 1].map((k) => (
            <span key={k} className="flex shrink-0" aria-hidden={k === 1}>
              {ticker.map((t, i) => (
                <span key={t} className="flex items-center gap-6 px-6 text-[12.5px] font-bold">
                  {t}
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: ["#c6f23a", "#ff4f9a", "#4cb2ff"][i % 3] }} />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      <div className="border-b border-white/80 bg-cloud/80 backdrop-blur-xl">
        <div className="wrap flex h-16 items-center gap-3 md:h-[70px] md:gap-6">
          <Link href="/" aria-label={`${business.name}: нүүр`} className="shrink-0">
            <Image src="/brand/logo-ink.png" alt="CASESHOP.MN" width={170} height={30} priority className="h-[22px] w-auto md:h-[26px]" />
          </Link>
          <nav className="hidden flex-1 items-center gap-0.5 xl:flex" aria-label="Үндсэн цэс">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className={`rounded-full px-3 py-2 text-[14px] font-extrabold transition hover:bg-white ${label === "MagSafe" ? "text-bubble" : ""}`}>
                {label}
              </Link>
            ))}
          </nav>
          <form action="/shop" role="search" className="relative ml-auto hidden md:block xl:ml-0">
            <SearchIcon size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-mute" />
            <input name="q" type="search" placeholder="Утас, загвар хайх" aria-label="Хайх" className="h-10 w-56 rounded-full border border-line bg-white pr-3 pl-10 text-[14px] outline-none placeholder:text-mute focus:border-ink" />
          </form>
          <div className="ml-auto flex items-center gap-1.5 md:ml-0">
            <MyPhonePill />
            <Link href="/shop" className="grid h-11 w-11 place-items-center md:hidden" aria-label="Хайх">
              <SearchIcon size={21} />
            </Link>
            <CartLink />
          </div>
        </div>
        <div className="wrap xl:hidden">
          <Scroller as="nav" label="Үндсэн цэс" small className="flex gap-1 overflow-x-auto pb-2 select-none [scrollbar-width:none]">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className={`shrink-0 rounded-full px-3 py-1.5 text-[13.5px] font-extrabold ${label === "MagSafe" ? "text-bubble" : ""}`}>
                {label}
              </Link>
            ))}
          </Scroller>
        </div>
      </div>
    </header>
  );
}
