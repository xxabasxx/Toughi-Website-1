"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bird, Search, CircleUserRound, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function Header({ settings }: { settings: Record<string, string> }) {
  const [userName, setUserName] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => setUserName(d?.user?.name || null)).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {settings.announcement && (
        <div className="bg-[#062e22] text-center text-[13px] py-2 px-3 text-[#f3d67a] font-medium">{settings.announcement}</div>
      )}
      <div className="glass border-b border-[#c9a227]/25 shadow-[0_10px_30px_-15px_rgba(6,46,34,.25)]">
        <div className="max-w-7xl mx-auto px-4 h-[68px] flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0b3d2e] to-[#062e22] flex items-center justify-center ring-2 ring-[#c9a227]/60 shadow-lg">
              <Bird className="text-[#e8c766]" size={24} />
            </span>
            <span className="leading-none">
              <span className="block text-[24px] font-black text-[#0b3d2e]">{settings.siteName || "طوقی"}</span>
              <span className="block text-[10px] text-[#8a6d1b] font-semibold mt-1 tracking-wide">TOGHI • بازار لوکس پرندگان</span>
            </span>
          </Link>

          <form action="/listings" className="hidden md:flex flex-1 max-w-xl mx-auto">
            <div className="relative w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0b3d2e]/50" size={19} />
              <input name="q" placeholder="دنبال چه پرنده‌ای می‌گردی؟ یعقوبی، کاسکو، قناری..."
                className="w-full bg-white border border-[#e5d9b8] rounded-full py-3 pr-11 pl-4 text-sm shadow-inner" />
            </div>
          </form>

          <div className="flex items-center gap-3 mr-auto md:mr-0">
            <span className="hidden xl:flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
              <ShieldCheck size={16} className="text-[#c9a227]" /> فروشندگان احراز هویت‌شده با نشان طلایی
            </span>
            {userName ? (
              <Link href="/account" className="flex items-center gap-2 bg-[#0b3d2e] text-white pl-4 pr-1.5 py-1.5 rounded-full font-bold text-sm shadow-lg hover:scale-[1.03] transition">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a227] to-[#8a6d1b] flex items-center justify-center text-[#062e22] font-black">{userName.slice(0, 1)}</span>
                <span className="max-w-[110px] truncate">{userName}</span>
              </Link>
            ) : (
              <Link href="/login" className="btn-gold btn-gold-sm">
                <CircleUserRound size={19} /> ورود | ثبت‌نام
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
