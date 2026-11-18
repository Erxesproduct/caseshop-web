/**
 * Business facts from caseshop.mn (Zochil shop 5855: shop settings, payment / delivery rules, delivery option, FAQ,
 * home banners) and the Facebook page facebook.com/caseshopmongolia, read on 2026-11-18. Nothing here is invented;
 * where Zochil contradicts itself the choice is noted and listed in docs/erxes/MANUAL-STEPS.md.
 */
export const business = {
  name: "CASESHOP MONGOLIA",
  domain: "caseshop.mn",
  /** Zochil shop description. */
  about: "Гар утасны дагалдах хэрэгслийн бөөний болон жижиглэнгийн худалдаа.",
  description: "CASESHOP MONGOLIA: iPhone, Samsung, Xiaomi, Huawei, Honor, Oppo, Vivo утасны гэр, MagSafe кейс. Сандэй плаза, 1042 тоот. Өдөртөө хүргэнэ.",
  phone: { display: "9540-1015", tel: "+97695401015" },
  email: "penny_org@yahoo.com",
  address: "Баянзүрх дүүрэг, 13-р хороолол, Сандэй плаза, 1042 тоот",
  mapQuery: "Sunday Plaza Ulaanbaatar",
  facebook: "https://www.facebook.com/caseshopmongolia",
  messenger: "https://m.me/caseshopmongolia",
  instagram: "https://www.instagram.com/caseshop8989/",
  youtube: "https://www.youtube.com/channel/UCOqbtniAEk5MlAOc_zgMxbg",
  /** Linked from the shop's first Zochil home banner. */
  tiktok: "https://vt.tiktok.com/ZSpYjaLoC/",
  /** Zochil payment rule: Khan Bank transfer or QPay. Online card checkout is disabled on Zochil. */
  payments: [
    { id: "qpay", name: "QPay", note: "Аль ч банкны аппаар QR уншуулж төлнө" },
    { id: "transfer", name: "Хаан банк шилжүүлэг", note: "Гүйлгээний утга дээр захиалгын дугаараа бичнэ" },
  ],
  /** Zochil `order_min_limit`. */
  minOrder: 10000,
  /** Delivery rule «20.000 дээш худалдан авалтанд хүргэлттэй». */
  deliveryMin: 20000,
  /** Zochil delivery option «Улаанбаатар · Үндсэн хүргэлт»: 5,000₮, free from 30,000₮ (`delivery_price_limit`). */
  cityFee: 5000,
  freeFrom: 30000,
  delivery: [
    { id: "city", name: "Улаанбаатар хот дотор", note: "12:00-оос өмнөх захиалга өдөртөө, дараах нь маргааш хүргэгдэнэ" },
    { id: "countryside", name: "Орон нутаг", note: "Орон нутгийн унаанд хийж өгнө. Унааны төлбөрийг холбогдож мэдэгдэнэ" },
    { id: "pickup", name: "Дэлгүүрээс очиж авах", note: "Сандэй плаза, 1042 тоот" },
  ],
  rules: {
    delivery: "Өдөр бүрийн 12:00 цагаас өмнө хийгдсэн захиалга өдөртөө хүргэгдэнэ. 12:00 цагаас хойш ирсэн захиалга маргааш нь хүргэгдэнэ.",
    deliveryMin: "Хүргэлт 20,000₮-өөс дээш худалдан авалтад. 30,000₮-өөс дээш бол хүргэлт үнэгүй.",
    transfer: "Дансаар шилжүүлэх бол гүйлгээний утга дээр захиалгын дугаараа бичнэ үү. Дансны мэдээллийг захиалга баталгаажуулахад илгээнэ.",
    ebarimt: "Утасны дугаараараа НӨАТ-ын баримт авна. Байгууллагаар авах бол 7 оронтой регистрийн дугаараа бичнэ үү.",
    fit: "Утасныхаа загварыг зөв сонгоорой: гэр нь зөвхөн тухайн загварт таарна. Эргэлзвэл утсаар асуугаарай.",
    wholesale: "Бөөний үнээр авах бол утсаар холбогдоорой.",
  },
} as const;

export type DeliveryId = (typeof business.delivery)[number]["id"];
export type PaymentId = (typeof business.payments)[number]["id"];
export const deliveryOption = (id: DeliveryId) => business.delivery.find((d) => d.id === id)!;
export const paymentOption = (id: PaymentId) => business.payments.find((p) => p.id === id)!;
export const storeMap = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(business.mapQuery);

/** Delivery fee for a goods subtotal: city 5,000₮ (free from 30,000₮); countryside told by phone (null); pick-up 0. */
export function deliveryFee(id: DeliveryId, subtotal: number): number | null {
  if (id === "pickup") return 0;
  if (id === "countryside") return null;
  return subtotal >= business.freeFrom ? 0 : business.cityFee;
}
