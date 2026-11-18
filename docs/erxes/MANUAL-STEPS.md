# CASESHOP MONGOLIA: erxes manual steps

Owner of every step below: **Terbish**, with CASESHOP MONGOLIA for credentials and decisions.

These steps happen inside the erxes 3.0 admin, not in code. The website reads the results through the environment
variables in `.env.example`. Never commit their values.

| Task | Status | What to do in erxes (admin path) |
| --- | --- | --- |
| [1.1] Import products, categories, prices | website done · manual import in erxes | Section 1.1 |
| [1.2] Payment setup (QPay) | website done · manual, blocked on QPay merchant credentials and the Khan Bank account | Section 1.2 |
| [1.3] eBarimt setup | website done · manual, blocked on PosAPI registration + TIN | Section 1.3 |
| [1.4] Delivery zones, fees, order statuses | website done · manual in erxes; thresholds to confirm | Section 1.4 |
| [1.5] Test order from cart to receipt | validation verified · real order blocked on erxes env vars + 1.2 + 1.3 | Section 1.5 |

There is no erxes instance for CASESHOP yet ("erxes 3.0: NOT SET"). Create it first, then add the env vars under
**Vercel → caseshop-web → Settings → Environment Variables**.

---

## 1.1 Import products, categories and prices

Source: caseshop.mn (Zochil shop 5855), scraped 2026-11-18: **711 products**, 150 Zochil categories, the logo,
5 home banners (one links to the shop's TikTok), 2 FAQ. The Facebook page (facebook.com/caseshopmongolia) gives no
content without a login beyond its name, profile photo and links (Instagram caseshop8989, YouTube).

The website imports **709 products**. Two are left out because their Zochil price looks like a typo:
«Pooh key case» (20₮, id 998657) and «Xiaomi Redmi Pad SE 8.7 инч Кэйс» (30₮, id 912921).

Categories: Zochil's tree is **brand → phone model**. The site keeps it: 14 brands (+ «Бусад» for 1 product) and
98 phone models that have products. 19 products sit only in a brand category (no model). Products are also tagged with
**features** read from their names (MagSafe, тунгалаг, зурагтай, карттай, хамгаалалттай, арьсан, силикон, камер
хамгаалалттай, тавиуртай, карбон): those are website filters, not erxes categories.

Files:

- `docs/erxes/caseshop-categories.csv`: **114 rows**, parent `CS`, brands `CS-<brand>`, models `CS-M-<zochilId>`.
- `docs/erxes/caseshop-products.csv`: **709 rows**, code `CS-<zochilId>`, name, main category (first model, or the
  brand), other model categories, price, brand, models, features, options (phone model / colour), variants with stock,
  stock, status, bestseller flag, photo paths.

Steps:

1. **Products & services → Categories**: import `caseshop-categories.csv` (parents first: it is already ordered).
2. **Settings → Import & Export → Import → Products**: upload `caseshop-products.csv`. Map `code → Code`,
   `name → Name`, `categoryCode → Category code`, `unitPrice → Unit price`, `type → Type`, `uom → UOM`,
   `description → Description`. Keep the codes: the website and `npm run sync:erxes` match on them. A case that fits
   several phone models (`otherModelCodes`) can only have one category in erxes; add the others as tags if needed.
3. **Options**: 617 products have choices, 583 a colour / pattern («Өнгө, хээ») and 61 a phone model («Утасны загвар»).
   The website requires them before adding to the cart. In erxes add them as **product variants**
   (Products → (product) → Variants) if stock is kept per colour / model.
4. **Inventories → Remainders**: stock on Zochil, 9,801 units in total; **10 products are sold out** and hidden by
   default. Only 8 products have stock per variant on Zochil (column `variants`); for them the stock is the sum.
5. Upload the photos (`public/images/p/*.webp`) on the products. Every imported product has at least one photo.
6. Run `npm run sync:erxes` once with a Client Portal token (`ERXES_APP_TOKEN`) to confirm the codes match (it also
   refreshes `src/data/lite.json`, which the cart reads).

## 1.2 Payment setup (QPay)

Zochil payment rule: **Khan Bank transfer or QPay**. In the Zochil shop settings QPay is **not connected**
(`has_qpay: false`) and online card checkout is off. erxes 3.0 has a QPay payment kind
(`backend/plugins/payment_api/src/constants.ts`).

1. Get CASESHOP's QPay merchant credentials (`client_id`, `client_secret`, `invoice_code`). If the shop has no QPay
   merchant, apply at qpay.mn. Owner: Terbish / CASESHOP.
2. **Settings → Payments → Add → QPay**: enter them. **Settings → Payments → (QPay) → Test**: a 100₮ invoice.
3. **Sales → Pipelines → «Вэбсайт» → Settings → Payments**: select QPay.
4. Khan Bank transfer is not an erxes payment kind: staff confirm it by hand. Get the account number and holder name
   (not on Zochil or Facebook). The site does not show an account number; it tells the customer the account is sent
   with the order confirmation and to write the order number (`CS-YYMMDD-XXXX`) as the transfer note.

Website (done): checkout offers **QPay** and **Хаан банк шилжүүлэг**, validated on the server (anything else is
rejected). The browser's prices are ignored; the server prices every line from the catalog.

## 1.3 eBarimt setup

Zochil has no eBarimt setting for this shop.

1. Collect from CASESHOP: company TIN, district code (СБД), VAT status, product classification code (phone cases and
   accessories).
2. Register for **PosAPI 3.0** (ebarimt.mn → Business → PosAPI) and install the PosAPI service.
3. **Settings → eBarimt → Add**: PosAPI URL, TIN, district code, VAT switches; assign it to the website pipeline.

Website (done): checkout asks «Хувь хүн» or «Байгууллага»; a company needs a 7-digit registry number, validated on the
server; the order message carries it.

## 1.4 Delivery zones, fees and order statuses

**Website (done)**, from Zochil shop 5855:

| Option | Fee | Rule |
| --- | --- | --- |
| Улаанбаатар хот дотор | 5,000₮, free from 30,000₮ | Only for orders from 20,000₮. Before 12:00 same day, after 12:00 next day |
| Орон нутаг | told by phone | Put on a local bus; from 20,000₮ |
| Дэлгүүрээс очиж авах | 0₮ | Sunday Plaza, 1042. From the 10,000₮ minimum |

- Minimum order 10,000₮ (Zochil `order_min_limit`). The fee is in the online total for the city; countryside returns
  `deliveryFee: null` and the order message says the bus fee is told by phone.

**erxes (manual):**

1. Import `docs/erxes/caseshop-delivery.csv`: services `DELIVERY-CITY` (5,000₮; staff set 0₮ from 30,000₮),
   `DELIVERY-COUNTRYSIDE` (no price), `PICKUP-STORE` (0₮).
2. **Sales → Boards → «Онлайн захиалга» → pipeline «Вэбсайт»**, stages: Шинэ захиалга → Загвар, үлдэгдэл шалгасан →
   Төлбөр хүлээгдэж буй → Төлбөр баталгаажсан → Хүргэлтэд гарсан / Авахад бэлэн → Хүргэгдсэн, plus «Цуцлагдсан».
3. **Frontline → Forms → (order form) → Settings**: create a sales card in «Шинэ захиалга» for every submission.

## 1.5 Test order from cart to receipt

**Verified on a local production build:** `npm run test:order -- http://localhost:3143` passes **27 checks**: empty
cart, unknown product, a case without its phone model chosen, a phone model the case does not list, a sold-out variant,
a sold-out product, below the 10,000₮ minimum, city delivery under 20,000₮, pick-up under 20,000₮ (no fee), city
25,000₮ + 5,000₮, free from 30,000₮, countryside (null fee), address required, QPay and Khan Bank accepted, StorePay
and unknown payment rejected, unknown delivery, company registry rejected and accepted, phone (incl. +976), email,
quantity over 10, the browser's price ignored, honeypot. Without erxes the order returns `503 not_configured` and the
checkout shows the phone number, the reference (`CS-YYMMDD-XXXX`) and the total.

Steps for a real test order:

1. **Frontline → Forms → Create** «Вэбсайт захиалга» with fields Нэр, Утас, Имэйл, Захиалга. Copy the form id and
   the field ids.
2. In Vercel set `ERXES_API_URL`, `ERXES_ORDER_FORM_ID`, `ERXES_ORDER_FIELD_IDS`, then redeploy.
3. Run `npm run test:order -- https://caseshop-web.vercel.app --send`. Expect 2 × 10,000₮ + 5,000₮ = 25,000₮ goods +
   5,000₮ city delivery = **30,000₮**.
4. In erxes: find the submission and its card → check the phone model → send the QPay invoice and pay it → issue the
   eBarimt → move the card to «Хүргэгдсэн» → void the test order.

---

## Open questions for CASESHOP

1. **Delivery thresholds**: Zochil says four things: minimum order 10,000₮, the rule «20,000₮-өөс дээш хүргэлттэй»,
   the FAQ «15,000₮-өөс дээш», and the delivery option free from 30,000₮. The site uses 10k minimum / delivery from
   20k / 5,000₮ / free from 30k. Which is right?
2. **Pick-up**: not a Zochil delivery option, but the shop is at Sunday Plaza 1042. Offered online at 0₮; keep it?
3. **Khan Bank account** number and holder for transfers.
4. **QPay merchant**: QPay is not connected on Zochil (`has_qpay: false`). Is there a merchant?
5. **Countryside**: bus fee by phone. Is there a fixed fee or a minimum?
6. **20₮ and 30₮ products** (Pooh key case, Redmi Pad SE 8.7 case): real price?
7. **19 products without a phone model** category: which phones do they fit?
8. **Model names** on Zochil are inconsistent («18 ProMax», «Pro Max», «модель», «Хэмжээ»); the site normalises them.
   Clean them in erxes?
9. **TIN / PosAPI** for eBarimt.
10. **Per-variant stock**: only 8 products have it. Track colour / model stock in erxes?
11. **Wholesale** («бөөний»): the site says to call. Separate wholesale prices in erxes?
12. **Email** penny_org@yahoo.com (from Zochil): still in use?
13. **711 vs 709**: the two excluded products above.
