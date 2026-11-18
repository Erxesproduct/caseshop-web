"use client";

import Image from "next/image";
import { useState } from "react";
import type { Photo } from "@/lib/catalog";

/** The shop's hand-held photos in a big phone frame, with thumbnails beside it. */
export function Gallery({ images, name }: { images: Photo[]; name: string }) {
  const [i, setI] = useState(0);
  const img = images[i] ?? images[0];
  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-1 md:flex-col" role="tablist" aria-label="Зургууд">
          {images.map((m, k) => (
            <button key={m.src} type="button" role="tab" aria-selected={k === i} aria-label={`Зураг ${k + 1}`} onClick={() => setI(k)} className="relative h-24 w-[72px] shrink-0 overflow-hidden rounded-2xl bg-white opacity-70 ring-ink transition hover:opacity-100 aria-selected:opacity-100 aria-selected:ring-2 md:h-28 md:w-[84px]">
              <Image src={m.thumb.src} alt="" fill sizes="84px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="phone aspect-[3/4] flex-1 rounded-[40px]">
        <Image key={img.src} src={img.src} alt={name} width={img.w} height={img.h} priority sizes="(min-width: 1024px) 560px, 100vw" className="fade-in absolute inset-0 h-full w-full object-cover" />
      </div>
    </div>
  );
}
