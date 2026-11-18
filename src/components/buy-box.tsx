"use client";

import { useState } from "react";
import { business } from "@/content/business";
import { cart, maxQty, useCart } from "@/lib/cart";
import { comboStock, getLite } from "@/lib/lite";
import { useMyPhone } from "@/lib/my-phone";
import { BasketIcon, CheckIcon, DeviceIcon } from "./icons";

const LABEL = { model: "Утасны загвар", colour: "Өнгө, хээ" } as const;
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");

/** Option chips (which phone, which colour) + «Сагсанд хийх». A single choice is picked for the customer. */
export function BuyBox({ slug }: { slug: string }) {
  const p = getLite(slug)!;
  const items = useCart();
  const mine = useMyPhone();
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const [warn, setWarn] = useState(false);

  // pre-select the remembered phone when this case lists it
  const guess = (key: string, values: string[]) => {
    if (values.length === 1) return values[0];
    if (key === "model" && mine?.modelName) return values.find((v) => norm(v) === norm(mine.modelName!)) ?? null;
    return null;
  };
  const choice = p.z.map(([key, values]) => picked[key] ?? guess(key, values));
  const full = choice.every(Boolean);
  const opt = p.z.length ? (full ? choice.join(" / ") : null) : null;

  if (p.k === 0)
    return (
      <div className="card p-5">
        <p className="display text-[24px]">Дууссан</p>
        <p className="mt-1 text-[14px] text-ink-2">Дахин ирэх эсэхийг Facebook чатаар асуугаарай.</p>
      </div>
    );

  const inCart = items.find((i) => i.slug === slug && i.opt === opt)?.qty ?? 0;
  const canAdd = (!p.z.length || full) && maxQty(slug, opt) > inCart;
  // a value is out when every combination through it is sold out (only for the 8 products with per-variant stock)
  const valueOut = (idx: number, v: string) => {
    if (!p.v) return false;
    return !p.v.some(([key, stock]) => key.split(" / ")[idx] === v && stock !== 0 && choice.every((c, j) => j === idx || !c || key.split(" / ")[j] === c));
  };

  return (
    <div>
      {p.z.map(([key, values], idx) => (
        <fieldset key={key} className="mt-5 first:mt-0">
          <legend className="kicker flex items-center gap-2 text-[12.5px]">
            {key === "model" && <DeviceIcon size={15} />}
            {LABEL[key]}
            {choice[idx] && <span className="text-bubble normal-case">· {choice[idx]}</span>}
          </legend>
          <div className="mt-2.5 flex flex-wrap gap-2" role="radiogroup" aria-label={LABEL[key]}>
            {values.map((v) => {
              const out = valueOut(idx, v);
              return (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={choice[idx] === v}
                  disabled={out}
                  onClick={() => {
                    setPicked((s) => ({ ...s, [key]: v }));
                    setWarn(false);
                  }}
                  className="chip disabled:cursor-not-allowed disabled:text-mute disabled:line-through"
                >
                  {v}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      {p.z.some(([key]) => key === "model") && <p className="mt-3 text-[13px] text-mute">{business.rules.fit}</p>}

      {warn && (
        <p role="alert" className="pop-in mt-4 rounded-2xl bg-bubble/10 px-4 py-3 text-[14px] font-bold text-bubble">
          {p.z.length && !full ? `${p.z.filter((_, i) => !choice[i]).map(([k]) => LABEL[k].toLowerCase()).join(", ")} сонгоно уу.` : "Үлдэгдэл хүрэлцэхгүй байна."}
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          if (!canAdd) return setWarn(true);
          cart.add(slug, opt);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1600);
        }}
        className={`btn mt-6 h-14 w-full text-[17px] ${added ? "btn-lime" : "btn-bubble"}`}
      >
        {added ? <CheckIcon size={20} /> : <BasketIcon size={20} />}
        {added ? "Сагсанд орлоо" : "Сагсанд хийх"}
      </button>
      {opt && p.v && <p className="mt-2 text-center text-[12.5px] text-mute">Энэ сонголтын үлдэгдэл: {comboStock(p, opt) ?? "—"}</p>}
      {inCart > 0 && <p className="mt-2 text-center text-[13px] font-bold text-ink-2">Сагсанд {inCart} ширхэг байна</p>}
    </div>
  );
}
