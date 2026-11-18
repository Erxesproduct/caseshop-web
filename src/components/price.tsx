import { formatPrice } from "@/lib/format";

export function Price({ price, compareAt, size = "md" }: { price: number; compareAt?: number | null; size?: "sm" | "md" | "lg" }) {
  const sale = compareAt != null && compareAt > price;
  const big = size === "lg" ? "text-[34px] md:text-[40px]" : size === "sm" ? "text-[16px]" : "text-[19px]";
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span className={`font-display font-black tracking-tight ${big} ${sale ? "text-bubble" : ""}`}>{formatPrice(price)}</span>
      {sale && <s className={`text-mute ${size === "lg" ? "text-[17px]" : "text-[13px]"}`}>{formatPrice(compareAt!)}</s>}
    </span>
  );
}
