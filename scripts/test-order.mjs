/**
 * End-to-end check of the website order flow (cart → /api/orders → erxes).
 *
 *   node scripts/test-order.mjs [baseUrl] [--send]
 *
 * Without --send it only runs the validation cases (no order reaches erxes).
 * With --send it also places ONE real test order, marked «ТЕСТ ЗАХИАЛГА: устгана уу» in the note.
 * Exit code 1 if any check fails.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith("--")) ?? "http://localhost:3000").replace(/\/$/, "");
const send = args.includes("--send");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(await readFile(path.join(root, "src", "data", "catalog.json"), "utf8"));
const P = catalog.products;
// Zochil rules: min order 10,000₮; delivery from 20,000₮; city 5,000₮, free from 30,000₮; countryside by bus (fee by
// phone, null); pick-up at the store (fee 0).
const orderable = (p) => p.stock == null || p.stock >= 2;
const optOf = (p) => (p.variants ? p.variants.find((v) => v.stock !== 0)?.key : p.options.map((o) => o.values[0]).join(" / ")) || null;
const item = (p, qty) => ({ slug: p.slug, opt: optOf(p), qty });

const plain = P.filter((p) => !p.options.length && orderable(p) && p.stock >= 3);
const at10 = plain.find((p) => p.price === 10000) ?? P.find((p) => p.price === 10000 && orderable(p) && !p.variants);
const at5 = P.find((p) => p.price === 5000 && orderable(p) && !p.variants);
const withModel = P.find((p) => p.options.some((o) => o.key === "model" && o.values.length > 1) && !p.variants && orderable(p));
const variant = P.find((p) => p.variants?.some((v) => v.stock === 0) && p.variants.some((v) => v.stock > 0));
const soldout = P.find((p) => p.stock === 0);

const order = {
  name: "Тест Захиалагч",
  phone: "99112233",
  delivery: "city",
  address: "Баянзүрх дүүрэг, 13-р хороолол, тест хаяг, 1 тоот",
  payment: "qpay",
  receiptType: "person",
  note: "ТЕСТ ЗАХИАЛГА: устгана уу",
  // 2 × 10,000₮ + 5,000₮ = 25,000₮ → city delivery 5,000₮ → 30,000₮
  items: [item(at10, 2), item(at5, 1)],
};
const SUBTOTAL = at10.price * 2 + at5.price;

async function post(body) {
  const res = await fetch(`${base}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { status: res.status, json: await res.json().catch(() => null) };
}

const valid = (r) => !r.json?.errors && (r.status === 200 || r.status === 503);
const rejects = (field) => (r) => r.status === 422 && !!r.json?.errors?.[field];
const total = (expected, fee) => (r) => valid(r) && r.json?.total === expected && (fee === undefined || r.json?.deliveryFee === fee);
const wrongModel = withModel && { slug: withModel.slug, opt: [...withModel.options.map((o) => (o.key === "model" ? "Nokia 3310" : o.values[0]))].join(" / "), qty: 1 };

const cases = [
  ["empty cart is rejected", { ...order, items: [] }, rejects("items")],
  ["unknown product is ignored (then empty)", { ...order, items: [{ slug: "no-such-case", opt: null, qty: 1 }] }, rejects("items")],
  ...(withModel ? [[`a case with choices needs them (${withModel.slug})`, { ...order, items: [{ slug: withModel.slug, opt: null, qty: 2 }] }, (r) => rejects("items")(r) && /сонгоно/.test(r.json.errors.items)]] : []),
  ...(wrongModel ? [["a phone model the case does not list is rejected", { ...order, items: [wrongModel] }, rejects("items")]] : []),
  ...(variant ? [[`a sold-out variant is not orderable (${variant.slug}: ${variant.variants.find((v) => v.stock === 0).key})`, { ...order, items: [{ slug: variant.slug, opt: variant.variants.find((v) => v.stock === 0).key, qty: 2 }] }, rejects("items")]] : []),
  ...(soldout ? [[`sold-out product is not orderable (${soldout.slug})`, { ...order, items: [item(soldout, 1)] }, rejects("items")]] : []),
  [`below the 10,000₮ minimum is rejected (${at5.slug})`, { ...order, delivery: "pickup", items: [item(at5, 1)] }, rejects("items")],
  [`city delivery under 20,000₮ is rejected (${at10.slug} × 1)`, { ...order, items: [item(at10, 1)] }, rejects("delivery")],
  ["pick-up under 20,000₮ passes, no fee", { ...order, delivery: "pickup", address: "", items: [item(at10, 1)] }, total(at10.price, 0)],
  [`city ${SUBTOTAL}₮ + 5,000₮ delivery`, order, total(SUBTOTAL + 5000, 5000)],
  [`city from 30,000₮ is free (${at10.slug} × 3)`, { ...order, items: [item(at10, 3)] }, total(at10.price * 3, 0)],
  ["countryside: bus fee by phone (null, not in total)", { ...order, delivery: "countryside", address: "Дархан-Уул, Дархан сум, унаагаар" }, total(SUBTOTAL, null)],
  ["address is required for city delivery", { ...order, address: "" }, rejects("address")],
  ["countryside needs an address", { ...order, delivery: "countryside", address: "" }, rejects("address")],
  ["QPay is accepted", order, valid],
  ["Khan Bank transfer is accepted", { ...order, payment: "transfer" }, valid],
  ["StorePay is not offered", { ...order, payment: "storepay" }, rejects("payment")],
  ["unknown payment is rejected", { ...order, payment: "cash" }, rejects("payment")],
  ["unknown delivery option is rejected", { ...order, delivery: "drone" }, rejects("delivery")],
  ["company eBarimt needs a 7-digit registry number", { ...order, receiptType: "company", regNo: "12" }, rejects("regNo")],
  ["company eBarimt with a valid registry number passes", { ...order, receiptType: "company", regNo: "1234567" }, valid],
  ["bad phone is rejected", { ...order, phone: "123" }, rejects("phone")],
  ["+976 phone prefix is accepted", { ...order, phone: "+976 9911 2233" }, valid],
  ["bad email is rejected", { ...order, email: "not-an-email" }, rejects("email")],
  ["quantity over 10 is ignored", { ...order, items: [{ ...item(at10, 11) }] }, rejects("items")],
  ["the browser's price is ignored", { ...order, items: order.items.map((i) => ({ ...i, price: 1 })) }, total(SUBTOTAL + 5000)],
  ["honeypot is silently accepted", { ...order, website: "spam" }, (r) => r.status === 200 && r.json?.ok === true],
];

let failed = 0;
console.log(`Order API checks against ${base}\n`);
for (const [label, body, ok] of cases) {
  const r = await post(body);
  const pass = ok(r);
  if (!pass) failed++;
  console.log(`${pass ? "✓" : "✗"} ${label}  (${r.status}${r.json?.errors ? " " + Object.keys(r.json.errors).join(",") : ""}${r.json?.total != null ? " total " + r.json.total : ""})`);
}

if (send) {
  const r = await post(order);
  if (r.status === 200 && r.json?.ok) {
    console.log(`\n✓ test order delivered to erxes: ${r.json.reference}, total ${r.json.total}₮ (expected ${SUBTOTAL + 5000})`);
    if (r.json.total !== SUBTOTAL + 5000) {
      failed++;
      console.log("✗ unexpected total");
    }
  } else if (r.status === 503 && r.json?.error === "not_configured") {
    console.log(`\n– test order NOT sent: erxes env vars are not set on ${base} (reference ${r.json.reference}). See .env.example.`);
  } else {
    failed++;
    console.log(`\n✗ test order failed: ${r.status} ${JSON.stringify(r.json)}`);
  }
}

console.log(failed ? `\n${failed} check(s) failed` : `\nall ${cases.length} checks passed`);
process.exit(failed ? 1 : 0);
