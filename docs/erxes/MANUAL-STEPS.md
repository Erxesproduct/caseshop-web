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
