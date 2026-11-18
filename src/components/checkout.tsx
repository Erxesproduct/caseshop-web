"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { business, deliveryFee, deliveryOption, paymentOption, type DeliveryId, type PaymentId } from "@/content/business";
import { cart, cartSubtotal, maxQty, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { resolveLine } from "@/lib/lite";
import type { OrderErrors } from "@/lib/orders/schema";
import { BasketIcon, ChatIcon, CheckIcon, DeviceIcon, MinusIcon, PhoneIcon, PlusIcon, TrashIcon } from "./icons";

type Done = { reference: string; subtotal: number; total: number; deliveryFee: number | null; delivery: DeliveryId; payment: PaymentId; lines: { name: string; opt: string | null; qty: number; total: number }[] };

const field = "mt-1.5 w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-[15.5px] outline-none transition focus:border-ink aria-invalid:border-bubble aria-invalid:bg-bubble/5";
const feeText = (fee: number | null) => (fee == null ? "Утсаар" : fee === 0 ? "Үнэгүй" : formatPrice(fee));

export function Checkout() {
  const items = useCart();
  const [delivery, setDelivery] = useState<DeliveryId>("city");
  const [payment, setPayment] = useState<PaymentId>("qpay");
  const [receiptType, setReceiptType] = useState<"person" | "company">("person");
  const [errors, setErrors] = useState<OrderErrors>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  const lines = items.flatMap((i) => {
    const l = resolveLine(i.slug, i.opt);
    return l ? [{ ...i, line: l }] : [];
  });
  const subtotal = cartSubtotal(items);
  const fee = deliveryFee(delivery, subtotal);
  const total = subtotal + (fee ?? 0);
  const belowMin = subtotal < business.minOrder;
  const shipBlocked = delivery !== "pickup" && subtotal < business.deliveryMin;
  const toFree = delivery === "city" && subtotal >= business.deliveryMin && subtotal < business.freeFrom ? business.freeFrom - subtotal : 0;

  if (done) return <Receipt done={done} />;

  if (!lines.length)
    return (
      <div className="card mx-auto max-w-lg px-8 py-14 text-center">
        <span className="float mx-auto grid h-20 w-20 place-items-center rounded-[26px] bg-bubble text-white" style={{ "--r": "-6deg" } as React.CSSProperties}>
          <BasketIcon size={34} />
        </span>
        <p className="display mt-6 text-[34px]">Сагс хоосон байна</p>
        <p className="mt-2 text-[15px] text-mute">Утсаа сонгоод таарах гэрээ олоорой.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/#finder" className="btn btn-ink">
            <DeviceIcon size={18} /> Утсаа сонго
          </Link>
          <Link href="/shop" className="btn btn-glass">
            Бүх гэр
          </Link>
        </div>
      </div>
    );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setNotice(null);
    setErrors({});
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          phone: f.get("phone"),
          email: f.get("email"),
          delivery,
          address: f.get("address") ?? "",
          payment,
          receiptType,
          regNo: f.get("regNo") ?? "",
          note: f.get("note"),
          website: f.get("website"),
          items: items.map(({ slug, opt, qty }) => ({ slug, opt, qty })),
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setDone({
          reference: json.reference,
          subtotal: json.subtotal ?? subtotal,
          total: json.total ?? total,
          deliveryFee: json.deliveryFee === undefined ? fee : json.deliveryFee,
          delivery,
          payment,
          lines: lines.map((l) => ({ name: l.line.product.n, opt: l.opt, qty: l.qty, total: l.line.price * l.qty })),
        });
        cart.clear();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.status === 422 && json?.errors) {
        setErrors(json.errors);
        setNotice("Мэдээллээ шалгаад дахин оролдоно уу.");
      } else if (json?.error === "not_configured") {
        setNotice(`Онлайн захиалгын систем тохируулагдаж байна. Захиалгаа ${business.phone.display} дугаарт эсвэл Facebook чатаар өгнө үү (лавлах код ${json.reference}, нийт ${formatPrice(json.total ?? total)}).`);
      } else {
        setNotice(`Захиалга илгээхэд алдаа гарлаа. Дахин оролдох эсвэл ${business.phone.display} дугаарт залгана уу.`);
      }
    } catch {
      setNotice("Интернэт холболтоо шалгаад дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  }

  const err = (k: keyof OrderErrors) => errors[k] && <p className="mt-1.5 text-[13.5px] font-bold text-bubble">{errors[k]}</p>;
  const step = (n: number, t: string, c: string) => (
    <h2 className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-2xl font-display text-[17px] font-black" style={{ background: c, color: c === "#c6f23a" ? "#162a4a" : "#fff" }}>
        {n}
      </span>
      <span className="display text-[24px]">{t}</span>
    </h2>
  );
  const radio = (on: boolean) => <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-ink bg-ink" : "border-ink/25"}`}>{on && <span className="h-2 w-2 rounded-full bg-lime" />}</span>;
  const option = "flex items-start gap-3 rounded-2xl border-2 border-line bg-white p-4 text-left transition hover:border-ink/40 aria-checked:border-ink aria-checked:bg-cloud";

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
      <div className="space-y-5">
        <section className="card overflow-hidden">
          <ul className="divide-y divide-line">
            {lines.map(({ slug, opt, qty, line }) => (
              <li key={`${slug}|${opt}`} className="flex gap-4 p-4">
                <Link href={`/p/${slug}`} className="phone relative h-28 w-21 shrink-0 rounded-2xl">
                  {line.product.t ? <Image src={line.product.t} alt="" fill sizes="84px" className="object-cover" /> : null}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/p/${slug}`} className="line-clamp-2 leading-snug font-extrabold hover:text-bubble">
                    {line.product.n}
                  </Link>
                  {opt && <span className="mt-1 text-[13px] font-bold text-ink-2">{opt}</span>}
                  <span className="text-[13px] text-mute">{formatPrice(line.price)} / ш</span>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                    <div className="flex items-center rounded-full bg-cloud">
                      <button type="button" onClick={() => cart.setQty(slug, opt, qty - 1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white" aria-label="Цөөлөх">
                        <MinusIcon size={15} />
                      </button>
                      <span className="w-7 text-center text-sm font-extrabold">{qty}</span>
                      <button type="button" onClick={() => cart.setQty(slug, opt, qty + 1)} disabled={qty >= maxQty(slug, opt)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white disabled:opacity-30" aria-label="Нэмэх">
                        <PlusIcon size={15} />
                      </button>
                    </div>
                    <span className="font-display text-[18px] font-black">{formatPrice(line.price * qty)}</span>
                    <button type="button" onClick={() => cart.setQty(slug, opt, 0)} className="grid h-9 w-9 place-items-center rounded-full text-mute hover:bg-bubble/10 hover:text-bubble" aria-label={`${line.product.n}: хасах`}>
                      <TrashIcon size={17} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5 md:p-7">
          {step(1, "Захиалагч", "#162a4a")}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-[14px] font-bold">
              Нэр
              <input name="name" autoComplete="name" required aria-invalid={!!errors.name} className={field} />
              {err("name")}
            </label>
            <label className="text-[14px] font-bold">
              Утас
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="99112233" required aria-invalid={!!errors.phone} className={field} />
              {err("phone")}
            </label>
            <label className="text-[14px] font-bold sm:col-span-2">
              Имэйл <span className="font-normal text-mute">(заавал биш)</span>
              <input name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} className={field} />
              {err("email")}
            </label>
          </div>
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        </section>

        <section className="card p-5 md:p-7">
          {step(2, "Хүргэлт", "#ff4f9a")}
          <div className="mt-5 grid gap-2.5" role="radiogroup" aria-label="Хүргэлт">
            {business.delivery.map((d) => (
              <button key={d.id} type="button" role="radio" aria-checked={delivery === d.id} onClick={() => setDelivery(d.id)} className={option}>
                {radio(delivery === d.id)}
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3 font-extrabold">
                    {d.name}
                    <span className="text-[14px] text-bubble">{feeText(deliveryFee(d.id, subtotal))}</span>
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-ink-2">{d.note}</span>
                </span>
              </button>
            ))}
          </div>
          {shipBlocked && !errors.delivery && <p className="mt-3 rounded-2xl bg-sun/40 px-4 py-3 text-[13.5px] font-bold">Хүргэлт {formatPrice(business.deliveryMin)}-өөс дээш захиалгад. Дахиад {formatPrice(business.deliveryMin - subtotal)}-ийн бараа нэмэх үү, эсвэл дэлгүүрээс очиж аваарай.</p>}
          {toFree > 0 && <p className="mt-3 rounded-2xl bg-lime/40 px-4 py-3 text-[13.5px] font-bold">Дахиад {formatPrice(toFree)}-ийн бараа нэмбэл хүргэлт үнэгүй.</p>}
          {err("delivery")}
          {delivery !== "pickup" && (
            <label className="mt-4 block text-[14px] font-bold">
              {delivery === "countryside" ? "Аймаг, сум, унааны мэдээлэл" : "Хаяг"}
              <textarea name="address" rows={2} required aria-invalid={!!errors.address} placeholder={delivery === "countryside" ? "Аймаг, сум, хүлээн авах хүн, унааны дугаар" : "Дүүрэг, хороо, байр, орц, давхар, тоот"} className={field} />
              {err("address")}
            </label>
          )}
          <p className="mt-3 text-[13.5px] text-ink-2">{delivery === "pickup" ? `${business.address}. Захиалга бэлэн болмогц утсаар мэдэгдэнэ.` : business.rules.delivery}</p>
        </section>

        <section className="card p-5 md:p-7">
          {step(3, "Төлбөр, и-баримт", "#4cb2ff")}
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Төлбөрийн хэлбэр">
            {business.payments.map((m) => (
              <button key={m.id} type="button" role="radio" aria-checked={payment === m.id} onClick={() => setPayment(m.id)} className={option}>
                {radio(payment === m.id)}
                <span>
                  <span className="block font-extrabold">{m.name}</span>
                  <span className="block text-[13px] leading-snug text-ink-2">{m.note}</span>
                </span>
              </button>
            ))}
          </div>
          {err("payment")}
          <div className="mt-6 flex gap-2" role="radiogroup" aria-label="И-баримтын төрөл">
            {(
              [
                ["person", "Хувь хүн"],
                ["company", "Байгууллага"],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" role="radio" aria-checked={receiptType === id} onClick={() => setReceiptType(id)} className="chip">
                {label}
              </button>
            ))}
          </div>
          {receiptType === "company" ? (
            <label className="mt-4 block text-[14px] font-bold">
              Байгууллагын регистр
              <input name="regNo" inputMode="numeric" maxLength={7} placeholder="1234567" aria-invalid={!!errors.regNo} className={field} />
              {err("regNo")}
            </label>
          ) : (
            <p className="mt-3 text-[13.5px] text-mute">И-баримтыг таны утасны дугаараар бүртгэнэ.</p>
          )}
          <label className="mt-5 block text-[14px] font-bold">
            Нэмэлт тайлбар <span className="font-normal text-mute">(утасны загвар, хүргэх цаг гэх мэт)</span>
            <textarea name="note" rows={2} className={field} />
          </label>
        </section>
      </div>

      <aside className="lg:sticky lg:top-36 lg:self-start">
        <div className="relative overflow-hidden rounded-[32px] bg-ink p-6 text-white md:p-8">
          <span className="blob -top-16 -right-12 h-48 w-48 bg-bubble" aria-hidden />
          <h2 className="display relative text-[32px]">Төлөх дүн</h2>
          <dl className="relative mt-5 space-y-2.5 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-white/70">Барааны дүн</dt>
              <dd className="font-bold">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/70">{deliveryOption(delivery).name}</dt>
              <dd className="font-bold">{feeText(fee)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-white/20 pt-3">
              <dt className="font-extrabold">Нийт</dt>
              <dd className="font-display text-[34px] font-black text-lime">{formatPrice(total)}</dd>
            </div>
          </dl>
          {payment === "transfer" && <p className="relative mt-4 rounded-2xl bg-white/10 p-4 text-[13px] leading-snug text-white/85">{business.rules.transfer}</p>}
          {belowMin && <p className="relative mt-4 rounded-2xl bg-sun px-4 py-3 text-[13.5px] font-bold text-ink">Захиалгын доод дүн {formatPrice(business.minOrder)}.</p>}
          {notice && (
            <p role="alert" className="relative mt-4 rounded-2xl bg-white px-4 py-3 text-[14px] font-bold text-ink">
              {notice}
            </p>
          )}
          {errors.items && <p className="relative mt-3 rounded-2xl bg-bubble px-3 py-2 text-[14px] font-bold">{errors.items}</p>}
          <button type="submit" disabled={busy || belowMin} className="btn btn-lime relative mt-6 h-14 w-full text-[17px] disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? "Илгээж байна…" : "Захиалга өгөх"}
          </button>
          <div className="relative mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-bold text-white/85">
            <a href={`tel:${business.phone.tel}`} className="inline-flex items-center gap-2 hover:text-lime">
              <PhoneIcon size={16} /> {business.phone.display}
            </a>
            <a href={business.messenger} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-lime">
              <ChatIcon size={16} /> Facebook чат
            </a>
          </div>
        </div>
      </aside>
    </form>
  );
}

function Receipt({ done }: { done: Done }) {
  const option = deliveryOption(done.delivery);
  return (
    <div className="mx-auto max-w-lg">
      <div className="card pop-in overflow-hidden">
        <div className="relative overflow-hidden bg-ink p-8 text-white">
          <span className="blob -top-10 -right-10 h-40 w-40 bg-lime" aria-hidden />
          <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-lime text-ink">
            <CheckIcon size={28} />
          </span>
          <h2 className="display relative mt-5 text-[38px]">Захиалга хүлээн авлаа!</h2>
          <p className="relative mt-2 text-white/80">
            Захиалгын дугаар: <b className="text-lime">{done.reference}</b>
          </p>
        </div>
        <div className="p-8">
          <ul className="space-y-2 text-[14.5px]">
            {done.lines.map((l) => (
              <li key={`${l.name}|${l.opt}`} className="flex justify-between gap-4">
                <span className="text-ink-2">
                  {l.name}
                  {l.opt && ` (${l.opt})`} × {l.qty}
                </span>
                <span className="shrink-0 font-bold">{formatPrice(l.total)}</span>
              </li>
            ))}
            <li className="flex justify-between gap-4">
              <span className="text-ink-2">{option.name}</span>
              <span className="shrink-0 font-bold">{feeText(done.deliveryFee)}</span>
            </li>
            <li className="flex justify-between gap-4 border-t border-line pt-3 text-lg font-extrabold">
              <span>Нийт</span>
              <span>{formatPrice(done.total)}</span>
            </li>
          </ul>
          <p className="mt-6 text-[14.5px] leading-relaxed text-ink-2">
            Манай ажилтан утсаар холбогдож утасны загвар, үлдэгдлийг баталгаажуулна.{" "}
            {done.payment === "transfer" ? `Хаан банкны дансаар шилжүүлэхдээ гүйлгээний утга дээр ${done.reference} гэж бичээрэй.` : `${paymentOption(done.payment).name}-ийн нэхэмжлэлийг таны утас руу илгээнэ.`} {done.delivery === "pickup" ? "" : business.rules.delivery} {business.rules.ebarimt}
          </p>
          <Link href="/" className="btn btn-ink mt-7">
            Нүүр хуудас
          </Link>
        </div>
      </div>
    </div>
  );
}
