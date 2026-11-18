import type { Metadata } from "next";
import { Checkout } from "@/components/checkout";

export const metadata: Metadata = { title: "Сагс", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="wrap pt-8 md:pt-12">
      <p className="kicker text-bubble">Захиалга</p>
      <h1 className="display mt-1 text-[48px] md:text-[72px]">Миний сагс</h1>
      <div className="mt-8">
        <Checkout />
      </div>
    </div>
  );
}
