"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { phoneHref, setMyPhone, useMyPhone } from "@/lib/my-phone";
import { ArrowIcon, CheckIcon, DeviceIcon } from "./icons";

type B = { id: string; name: string; count: number };
type M = { id: string; name: string; brand: string; count: number };

const TINT: Record<string, string> = { iphone: "#162a4a", samsung: "#4cb2ff", xiaomi: "#ff8a3d", huawei: "#ff4f9a", honor: "#b39bff", oppo: "#3fcf8e", vivo: "#5b7cff" };

/**
 * «Утсаа сонго»: brand → series (the shop's own Zochil categories, with how many cases fit) → the matching cases.
 * The choice is remembered in this browser, so the header and the shop can say «for your phone».
 */
export function PhoneFinder({ brands, models, compact = false }: { brands: B[]; models: M[]; compact?: boolean }) {
  const mine = useMyPhone();
  const router = useRouter();
  const [brand, setBrand] = useState<string | null>(null);
  const active = brand ?? mine?.brand ?? "iphone";
  const list = models.filter((m) => m.brand === active);
  const b = brands.find((x) => x.id === active)!;

  const pick = (model: M | null) => {
    const p = { brand: active, brandName: b.name, model: model?.id ?? null, modelName: model?.name ?? null };
    setMyPhone(p);
    router.push(phoneHref(p));
  };

  return (
    <div className="glass rounded-[32px] p-5 md:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-white">
          <DeviceIcon size={22} />
        </span>
        <div>
          <p className="display text-[24px] md:text-[30px]">Утсаа сонго</p>
          <p className="text-[14px] text-ink-2">Таны утсанд таарах гэрүүдийг л харуулна.</p>
        </div>
        {mine && (
          <Link href={phoneHref(mine)} className="sticker ml-auto bg-lime text-ink">
            <CheckIcon size={14} /> Миний утас: {mine.modelName ?? mine.brandName}
          </Link>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="radiogroup" aria-label="Брэнд">
        {brands
          .filter((x) => x.count >= (compact ? 10 : 1))
          .map((x) => (
            <button key={x.id} type="button" role="radio" aria-checked={active === x.id} onClick={() => setBrand(x.id)} className="chip">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: TINT[x.id] ?? "#8a93ad" }} />
              {x.name}
              <span className="text-[12px] opacity-60">{x.count}</span>
            </button>
          ))}
      </div>

      <div key={active} className="fade-in mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        <button type="button" onClick={() => pick(null)} className="group flex items-center justify-between gap-2 rounded-2xl bg-ink px-4 py-3 text-left text-white transition hover:bg-bubble">
          <span className="font-display text-[15px] leading-tight font-bold">Бүх {b.name}</span>
          <ArrowIcon size={16} className="shrink-0 transition group-hover:translate-x-1" />
        </button>
        {list.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => pick(m)}
            className={`group flex items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-ink ${mine?.model === m.id ? "border-bubble bg-bubble/10" : "border-transparent bg-white"}`}
          >
            <span className="font-display text-[15px] leading-tight font-bold">{m.name}</span>
            <span className="shrink-0 rounded-full bg-cloud-2 px-2 text-[12px] font-bold text-ink-2">{m.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
