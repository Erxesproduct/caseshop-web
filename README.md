# caseshop-web

Storefront for **CASESHOP MONGOLIA** (caseshop.mn, Zochil shop 5855): phone cases for iPhone, Samsung, Xiaomi, Huawei,
Honor, Oppo, Vivo and more. Next.js 16 (App Router), Tailwind 4, static product pages, orders to erxes 3.0.

- 709 products, 98 phone models, MagSafe / clear / cute / wallet / tough / leather filters
- «Утсаа сонго» phone finder that remembers the customer's phone
- Cart and checkout: QPay or Khan Bank transfer, city delivery 5,000₮ (free from 30,000₮), countryside, pick-up
- `/api/orders` validates on the server and sends the order to erxes (`widgetsSaveLead`)

```bash
npm install
npm run dev            # http://localhost:3000
npm run lint && npm run typecheck && npm run build
npm run test:order -- http://localhost:3000          # 27 order API checks
npm run test:order -- https://<url> --send           # + one real test order (needs erxes env vars)
npm run sync:erxes                                   # check product codes / prices against erxes
```

Environment variables: see `.env.example` (never commit values). erxes admin steps and open questions:
[`docs/erxes/MANUAL-STEPS.md`](docs/erxes/MANUAL-STEPS.md).
