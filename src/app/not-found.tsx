import Link from "next/link";
import { DeviceIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="wrap grid place-items-center pt-16 md:pt-24">
      <div className="card max-w-md p-10 text-center">
        <p className="display text-[96px] leading-none text-bubble">404</p>
        <h1 className="display mt-3 text-[30px]">Энэ гэр олдсонгүй</h1>
        <p className="mt-2 text-[15px] text-mute">Хайсан хуудас байхгүй байна.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/#finder" className="btn btn-ink">
            <DeviceIcon size={18} /> Утсаа сонго
          </Link>
          <Link href="/shop" className="btn btn-glass">
            Бүх гэр
          </Link>
        </div>
      </div>
    </div>
  );
}
