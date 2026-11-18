"use client";

import Link from "next/link";
import { phoneHref, phoneLabel, setMyPhone, useMyPhone } from "@/lib/my-phone";
import { CloseIcon, DeviceIcon } from "./icons";

/** Header pill: the remembered phone, or a prompt to pick one. */
export function MyPhonePill() {
  const mine = useMyPhone();
  if (!mine)
    return (
      <Link href="/#finder" className="hidden items-center gap-2 rounded-full bg-lime px-3.5 py-2 text-[13px] font-extrabold text-ink transition hover:-translate-y-0.5 sm:inline-flex">
        <DeviceIcon size={16} /> Утсаа сонго
      </Link>
    );
  return (
    <span className="hidden items-center rounded-full bg-ink text-white sm:inline-flex">
      <Link href={phoneHref(mine)} className="flex items-center gap-2 py-2 pr-1 pl-3.5 text-[13px] font-extrabold" title="Миний утсанд таарах гэрүүд">
        <DeviceIcon size={16} className="text-lime" />
        <span className="max-w-[140px] truncate">{phoneLabel(mine)}</span>
      </Link>
      <button type="button" onClick={() => setMyPhone(null)} className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:text-white" aria-label="Утсаа арилгах">
        <CloseIcon size={14} />
      </button>
    </span>
  );
}
