"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import type { ListingT } from "@/lib/client";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  const [items, setItems] = useState<ListingT[]>([]);
  const [loading, setLoading] = useState(true);
  const load = () => {
    let ids: number[] = [];
    try { ids = JSON.parse(localStorage.getItem("toghi-favs")||"[]"); } catch {}
    if (!ids.length) { setItems([]); setLoading(false); return; }
    fetch("/api/listings?all=0").then(r=>r.json()).then((d:ListingT[])=>{ setItems(d.filter(x=>ids.includes(x.id))); setLoading(false); }).catch(()=>setLoading(false));
  };
  useEffect(()=>{ load(); window.addEventListener("toghi-fav", load); return ()=>window.removeEventListener("toghi-fav", load); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-10 pb-4">
      <div className="text-center mb-9">
        <span className="w-16 h-16 bg-[#062e22] ring-4 ring-[#c9a227]/40 rounded-full flex items-center justify-center mx-auto"><Heart className="text-[#e8c766]" size={28}/></span>
        <h1 className="text-3xl font-black text-[#0b3d2e] mt-4">پرنده‌های نشان‌شده‌ی من</h1>
        <p className="text-gray-500 text-sm mt-2">آگهی‌هایی که دوست داشتی اینجا نگه داشته می‌شوند تا گمشان نکنی.</p>
      </div>
      {loading ? <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="bg-white rounded-[26px] h-80 animate-pulse"/>)}</div>
      : items.length===0 ? (
        <div className="text-center py-20 bg-white rounded-[32px] ring-1 ring-[#e8dcbb]">
          <Heart className="mx-auto text-[#e8dcbb]" size={54}/>
          <h3 className="font-black text-xl text-[#0b3d2e] mt-4">هنوز پرنده‌ای را نشان نکرده‌ای</h3>
          <p className="text-gray-500 text-sm mt-2">روی قلب هر آگهی بزن تا اینجا ذخیره شود.</p>
          <Link href="/listings" className="inline-block mt-5 bg-[#0b3d2e] text-[#e8c766] px-6 py-3 rounded-full font-black text-sm">رفتن به بازار طوقی</Link>
        </div>
      ) : <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{items.map(it=><ListingCard key={it.id} item={it}/>)}</div>}
    </div>
  );
}
