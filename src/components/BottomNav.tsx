"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, LayoutGrid, Plus, Bookmark, CircleUserRound } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Me = { name: string } | null;

export default function BottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<Me>(null);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => setUser(d?.user || null)).catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    const read = () => { try { setFavCount(JSON.parse(localStorage.getItem("toghi-favs") || "[]").length); } catch {} };
    read();
    window.addEventListener("toghi-fav", read);
    window.addEventListener("storage", read);
    return () => window.removeEventListener("toghi-fav", read);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const Item = ({ href, label, icon: Icon, badge }: { href: string; label: string; icon: typeof Home; badge?: number }) => {
    const active = isActive(href);
    return (
      <Link href={href} className={`relative flex flex-col items-center justify-center gap-1 flex-1 py-2 transition ${active ? "text-[#e8c766]" : "text-emerald-100/60 hover:text-white"}`}>
        <span className="relative">
          <Icon size={24} strokeWidth={active ? 2.4 : 1.9} />
          {!!badge && <span className="absolute -top-1.5 -left-2 bg-[#c9a227] text-[#062e22] text-[10px] font-black min-w-[18px] h-[18px] px-0.5 rounded-full flex items-center justify-center ring-2 ring-[#062e22]">{badge.toLocaleString("fa-IR")}</span>}
        </span>
        <span className={`text-[11px] ${active ? "font-black" : "font-semibold"}`}>{label}</span>
        {active && <span className="absolute top-0 w-8 h-[3px] rounded-full bg-gradient-to-l from-[#c9a227] to-[#e8c766]" />}
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-[60]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="bg-[#062e22]/96 backdrop-blur-xl border-t border-[#c9a227]/45 shadow-[0_-10px_28px_rgba(6,46,34,.3)]">
        <div className="max-w-2xl mx-auto flex items-end px-2">
          <Item href="/" label="خانه" icon={Home} />
          <Item href="/listings" label="آگهی‌ها" icon={LayoutGrid} />

          {/* دکمه ثبت آگهی — دایره توخالی با + طلایی بزرگ در وسط */}
          <Link href="/post" className="flex flex-col items-center flex-1 group" aria-label="ثبت آگهی">
            <span className="relative -top-5 w-[62px] h-[62px] rounded-full bg-[#062e22] border-[3px] border-[#e8c766] flex items-center justify-center shadow-[0_0_0_5px_#062e22,0_0_22px_rgba(232,199,102,.55)] group-hover:scale-110 group-hover:border-[#f3d67a] group-active:scale-95 transition-transform">
              <Plus size={36} strokeWidth={3.2} className="text-[#e8c766] drop-shadow-[0_0_6px_rgba(232,199,102,.8)]" />
            </span>
            <span className="text-[11px] font-black text-[#e8c766] -mt-3 pb-2">ثبت آگهی</span>
          </Link>

          <Item href="/favorites" label="نشان‌ها" icon={Bookmark} badge={favCount} />
          <Item href={user ? "/account" : "/login"} label={user ? "حساب من" : "ورود"} icon={CircleUserRound} />
        </div>
      </div>
    </nav>
  );
}
