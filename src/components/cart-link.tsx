"use client";

import Link from "next/link";
import { cartCount, useCart } from "@/lib/cart";
import { BasketIcon } from "./icons";

export function CartLink() {
  const n = cartCount(useCart());
  return (
    <Link href="/cart" className="relative grid h-11 w-11 place-items-center rounded-full transition hover:bg-white" aria-label={n ? `Сагс, ${n} бараа` : "Сагс"}>
      <BasketIcon size={22} />
      {n > 0 && (
        <span key={n} className="pop-in absolute top-0 right-0 grid h-5 min-w-5 place-items-center rounded-full bg-bubble px-1 text-[11px] font-extrabold text-white">
          {n}
        </span>
      )}
    </Link>
  );
}
