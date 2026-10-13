"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, MapPin, Eye, BadgeCheck, Zap, Crown } from "lucide-react";
import { formatPrice, timeAgo, type ListingT } from "@/lib/client";

export default function ListingCard({ item }: { item: ListingT }) {
  const [fav, setFav] = useState(false);
  useEffect(() => {
    try { setFav(JSON.parse(localStorage.getItem("toghi-favs")||"[]").includes(item.id)); } catch {}
  }, [item.id]);
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    let arr: number[] = [];
    try { arr = JSON.parse(localStorage.getItem("toghi-favs")||"[]"); } catch {}
    arr = fav ? arr.filter(x=>x!==item.id) : [...arr, item.id];
    localStorage.setItem("toghi-favs", JSON.stringify(arr));
    setFav(!fav); window.dispatchEvent(new Event("toghi-fav"));
  };
  return (
    <Link href={`/listings/${item.id}`} className="card-hover group bg-white rounded-[26px] overflow-hidden ring-1 ring-[#e8dcbb] lux-shadow block">
      <div className="relative h-56 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image || "/images/hero-pigeon.jpg"} alt={item.title} className="card-img w-full h-full object-cover" loading="lazy"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
        <button onClick={toggle} className={`absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur transition ${fav?"bg-[#c9a227] text-[#062e22]":"bg-white/85 text-[#0b3d2e] hover:bg-[#c9a227]"}`}>
          <Heart size={19} fill={fav?"currentColor":"none"} />
        </button>
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {item.featured && <span className="flex items-center gap-1 bg-gradient-to-l from-[#c9a227] to-[#e8c766] text-[#062e22] text-[11px] font-black px-2.5 py-1 rounded-full shadow"><Crown size={12}/> ویژه طلایی</span>}
          {item.urgent && <span className="flex items-center gap-1 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full"><Zap size={12}/> فوری</span>}
        </div>
        <div className="absolute bottom-3 right-3 left-3 flex items-end justify-between text-white">
          <span className="flex items-center gap-1 text-xs font-bold bg-black/35 backdrop-blur px-2.5 py-1 rounded-full"><MapPin size={13} className="text-[#e8c766]"/>{item.city}</span>
          <span className="flex items-center gap-1 text-[11px] bg-black/35 backdrop-blur px-2 py-1 rounded-full"><Eye size={12}/>{(item.views||0).toLocaleString("fa-IR")}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-extrabold text-[15px] leading-6 text-[#14201b] line-clamp-2 min-h-[48px] group-hover:text-[#0b3d2e]">{item.title}</h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          {item.breed && <span className="bg-[#faf6ec] ring-1 ring-[#e8dcbb] px-2 py-1 rounded-full font-bold text-[#8a6d1b]">{item.breed}</span>}
          <span>{timeAgo(item.createdAt)}</span>
          {item.verified && <span className="flex items-center gap-0.5 text-emerald-700 font-bold"><BadgeCheck size={14} className="text-[#c9a227]"/> احراز شده</span>}
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-[#e8dcbb]">
          <span className="text-[11px] text-gray-400 font-semibold">{item.sellerName}</span>
          <span className={`font-black ${item.price? "text-[#0b3d2e] text-[17px]":"text-[#b48a12]"}`}>{formatPrice(item.price)}</span>
        </div>
      </div>
    </Link>
  );
}
