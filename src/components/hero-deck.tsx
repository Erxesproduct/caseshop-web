"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Banner = { src: string; w: number; h: number; href: string | null };

/**
 * The owner's Zochil banners (portrait photo grids of cases in hand) as a deck of phone cards: the top card slides
 * away every few seconds or on tap, the next one comes up. The TikTok banner keeps its link.
 */
export function HeroDeck({ banners }: { banners: Banner[] }) {
  const [top, setTop] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = banners.length;
  useEffect(() => {
    if (paused || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setTop((x) => (x + 1) % n), 4200);
    return () => window.clearInterval(t);
  }, [paused, n]);

  return (
    <div className="relative mx-auto aspect-[3/4] w-[78%] max-w-[380px] sm:w-full" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel" aria-label="Шинэ гэрүүд">
      {banners.map((b, k) => {
        const pos = (k - top + n) % n;
        const style = {
          zIndex: n - pos,
          transform: pos === 0 ? "rotate(-3deg)" : pos === 1 ? "translate(9%, 3%) rotate(5deg) scale(.95)" : pos === 2 ? "translate(-8%, 5%) rotate(-9deg) scale(.9)" : "translate(0, 8%) scale(.85)",
          opacity: pos > 2 ? 0 : 1,
        };
        const img = <Image src={b.src} alt={pos === 0 ? `CASESHOP гэрүүд ${k + 1}` : ""} fill priority={k === 0} loading={k === 0 ? undefined : "eager"} sizes="380px" className="object-cover" />;
        return (
          <div key={b.src} className="phone absolute inset-0 rounded-[40px] border-[6px] border-white transition-all duration-700 ease-[cubic-bezier(.2,.9,.3,1.2)]" style={style} aria-hidden={pos !== 0}>
            {img}
            {pos === 0 &&
              (b.href ? (
                <a href={b.href} target="_blank" rel="noreferrer" className="sticker absolute bottom-4 left-4 bg-ink text-white">
                  ▶ TikTok-оос үзэх
                </a>
              ) : null)}
            {pos === 0 && n > 1 && <button type="button" onClick={() => setTop((x) => (x + 1) % n)} className="absolute inset-0" aria-label="Дараагийн зураг" style={b.href ? { bottom: 64 } : undefined} />}
          </div>
        );
      })}
      <div className="absolute -bottom-9 left-1/2 flex -translate-x-1/2 gap-1.5">
        {banners.map((b, k) => (
          <button key={b.src} type="button" onClick={() => setTop(k)} aria-label={`Зураг ${k + 1}`} aria-current={k === top} className="h-2 w-2 rounded-full bg-ink/20 transition-all aria-[current=true]:w-6 aria-[current=true]:bg-bubble" />
        ))}
      </div>
    </div>
  );
}
