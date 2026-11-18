import Image from "next/image";
import Link from "next/link";
import { brandName, soldOut, type Product } from "@/lib/catalog";
import { MagnetIcon } from "./icons";
import { Price } from "./price";

const BADGE: Record<string, [string, string]> = {
  magsafe: ["MagSafe", "bg-ink text-white"],
  clear: ["Тунгалаг", "bg-sky text-white"],
  cute: ["Хөөрхөн", "bg-bubble text-white"],
  wallet: ["Карттай", "bg-sun text-ink"],
  tough: ["Хамгаалалт", "bg-lime text-ink"],
  leather: ["Арьсан", "bg-[#8a5a3c] text-white"],
};

/** A case in a phone-shaped frame; the second photo slides in on hover and a camera island pops up. */
export function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const [a, b] = p.images;
  const out = soldOut(p);
  const colours = p.options.find((o) => o.key === "colour")?.values.length ?? 0;
  const badge = p.features.map((f) => BADGE[f]).find(Boolean);
  return (
    <article className="group relative flex h-full flex-col">
      <Link href={`/p/${p.slug}`} className="phone block aspect-[3/4] transition duration-300 group-hover:-translate-y-1.5 group-hover:rotate-[-1.5deg]">
        {a ? (
          <>
            <Image src={a.thumb.src} alt={p.name} width={a.thumb.w} height={a.thumb.h} priority={priority} sizes="(min-width: 1024px) 240px, 50vw" className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${b ? "group-hover:opacity-0" : "group-hover:scale-105"} ${out ? "opacity-40 grayscale" : ""}`} />
            {b && <Image src={b.thumb.src} alt="" width={b.thumb.w} height={b.thumb.h} sizes="(min-width: 1024px) 240px, 50vw" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100" />}
          </>
        ) : (
          <span className="display absolute inset-0 grid place-items-center text-[28px] text-ink/15">CASE</span>
        )}
        <span className="absolute right-2.5 bottom-2.5 left-2.5 flex flex-wrap items-end justify-between gap-1.5">
          {badge ? (
            <span className={`sticker ${badge[1]}`}>
              {badge[0] === "MagSafe" && <MagnetIcon size={12} />}
              {badge[0]}
            </span>
          ) : (
            <span />
          )}
          {out ? <span className="sticker bg-white text-ink">Дууссан</span> : colours > 1 && <span className="sticker bg-white/90 text-ink">{colours} өнгө</span>}
        </span>
      </Link>
      <div className="mt-3 flex flex-1 flex-col px-1">
        <p className="kicker text-[11px] text-mute">{brandName(p.brand)}</p>
        <Link href={`/p/${p.slug}`} className="mt-0.5 line-clamp-2 text-[14.5px] leading-snug font-extrabold hover:text-bubble">
          {p.name}
        </Link>
        <div className="mt-auto pt-1.5">
          <Price price={p.price} compareAt={p.compareAt} size="sm" />
        </div>
      </div>
    </article>
  );
}
