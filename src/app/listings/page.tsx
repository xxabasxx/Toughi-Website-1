"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import type { ListingT, CategoryT } from "@/lib/client";
import { CITIES } from "@/lib/cities";
import { Search, SlidersHorizontal, Bird, X } from "lucide-react";

function ListingsInner() {
  const sp = useSearchParams();
  const [items, setItems] = useState<ListingT[]>([]);
  const [cats, setCats] = useState<CategoryT[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [q, setQ] = useState(sp.get("q") || "");
  const [cat, setCat] = useState(sp.get("cat") || "");
  const [city, setCity] = useState(sp.get("city") || "همه شهرها");
  const [sort, setSort] = useState("newest");
  const [featuredOnly, setFeaturedOnly] = useState(sp.get("featured") === "1");
  const [min, setMin] = useState(""); const [max, setMax] = useState("");

  useEffect(() => { fetch("/api/categories").then(r=>r.json()).then(setCats).catch(()=>{}); }, []);
  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (q) p.set("q", q); if (cat) p.set("cat", cat); if (city) p.set("city", city);
    p.set("sort", sort); if (featuredOnly) p.set("featured","1");
    if (min) p.set("min", min); if (max) p.set("max", max);
    const t = setTimeout(() => {
      fetch(`/api/listings?${p}`).then(r=>r.json()).then(d=>{ setItems(Array.isArray(d)?d:[]); setLoading(false); }).catch(()=>setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, cat, city, sort, featuredOnly, min, max]);

  const activeCat = cats.find(c=>c.slug===cat);
  const Filters = (
    <div className="space-y-5">
      <div>
        <h4 className="font-black text-[#0b3d2e] mb-2.5 text-sm">دسته‌بندی</h4>
        <button onClick={()=>setCat("")} className={`block w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold mb-1.5 transition ${!cat?"bg-[#0b3d2e] text-[#e8c766]":"bg-white ring-1 ring-[#e8dcbb] hover:ring-[#c9a227]"}`}>همه دسته‌ها</button>
        {cats.map(c=>(
          <button key={c.id} onClick={()=>setCat(c.slug)} className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold mb-1.5 transition flex justify-between ${cat===c.slug?"bg-[#0b3d2e] text-[#e8c766]":"bg-white ring-1 ring-[#e8dcbb] hover:ring-[#c9a227]"}`}>
            <span>{c.icon} {c.name}</span><span className="text-xs opacity-70">{((c as CategoryT & {count?:number}).count||0).toLocaleString("fa-IR")}</span>
          </button>
        ))}
      </div>
      <div>
        <h4 className="font-black text-[#0b3d2e] mb-2.5 text-sm">شهر</h4>
        <select value={city} onChange={e=>setCity(e.target.value)} className="w-full bg-white ring-1 ring-[#e8dcbb] rounded-xl px-3 py-3 text-sm font-semibold">
          {CITIES.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <h4 className="font-black text-[#0b3d2e] mb-2.5 text-sm">محدوده قیمت (تومان)</h4>
        <div className="flex gap-2">
          <input value={min} onChange={e=>setMin(e.target.value.replace(/[^0-9]/g,""))} placeholder="از" inputMode="numeric" className="w-full bg-white ring-1 ring-[#e8dcbb] rounded-xl px-3 py-2.5 text-sm"/>
          <input value={max} onChange={e=>setMax(e.target.value.replace(/[^0-9]/g,""))} placeholder="تا" inputMode="numeric" className="w-full bg-white ring-1 ring-[#e8dcbb] rounded-xl px-3 py-2.5 text-sm"/>
        </div>
        {(min||max) && <p className="text-[11px] text-gray-500 mt-2">{min?Number(min).toLocaleString("fa-IR"):"۰"} تا {max?Number(max).toLocaleString("fa-IR"):"∞"} تومان</p>}
      </div>
      <label className="flex items-center justify-between bg-white ring-1 ring-[#e8dcbb] rounded-xl px-4 py-3 cursor-pointer">
        <span className="text-sm font-black text-[#0b3d2e]">👑 فقط آگهی‌های ویژه طلایی</span>
        <input type="checkbox" checked={featuredOnly} onChange={e=>setFeaturedOnly(e.target.checked)} className="w-5 h-5 accent-[#c9a227]" style={{boxShadow:"none"}}/>
      </label>
      {(cat||q||featuredOnly||min||max||city!=="همه شهرها") && (
        <button onClick={()=>{setCat("");setQ("");setFeaturedOnly(false);setMin("");setMax("");setCity("همه شهرها");}} className="w-full bg-red-50 text-red-600 ring-1 ring-red-200 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-1"><X size={15}/> پاک کردن همه فیلترها</button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
      <div className="relative overflow-hidden rounded-[32px] bg-[#062e22] px-6 py-9 md:p-10 mb-7">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={activeCat?.image || "/images/pigeon-pair.jpg"} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35"/>
        <div className="absolute inset-0 bg-gradient-to-l from-[#062e22] via-[#062e22]/75 to-transparent"/>
        <div className="relative text-white">
          <p className="text-[#e8c766] font-black text-sm">✦ بازار طوقی</p>
          <h1 className="text-3xl md:text-4xl font-black mt-1.5">{activeCat ? `${activeCat.icon} ${activeCat.name}` : "همه آگهی‌های طوقی"}</h1>
          <p className="text-emerald-100/85 text-sm mt-2">{activeCat?.description || "بهترین پرندگان و حیوانات اصیل ایران، مستقیم از پرورش‌دهندگان معتبر"}</p>
          <div className="relative max-w-xl mt-6">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={19}/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="جستجو در آگهی‌ها..." className="w-full bg-white rounded-full py-3.5 pr-11 pl-4 text-sm text-gray-800 shadow-xl"/>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <aside className="hidden lg:block w-72 shrink-0 sticky top-36 bg-[#fffdf6] ring-1 ring-[#e8dcbb] rounded-[26px] p-5 lux-shadow">
          <h3 className="font-black text-[#0b3d2e] flex items-center gap-2 mb-4"><SlidersHorizontal size={18} className="text-[#c9a227]"/> فیلترها</h3>
          {Filters}
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <button onClick={()=>setFiltersOpen(true)} className="lg:hidden flex items-center gap-1.5 bg-[#0b3d2e] text-[#e8c766] px-4 py-2.5 rounded-full text-sm font-black"><SlidersHorizontal size={16}/> فیلترها</button>
            <span className="text-sm font-bold text-gray-500">{loading ? "در حال جستجو..." : `${items.length.toLocaleString("fa-IR")} آگهی پیدا شد`}</span>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="mr-auto bg-white ring-1 ring-[#e8dcbb] rounded-full px-4 py-2.5 text-sm font-bold">
              <option value="newest">جدیدترین‌ها</option><option value="cheapest">ارزان‌ترین</option><option value="expensive">گران‌ترین</option><option value="popular">پربازدیدترین</option>
            </select>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{[...Array(6)].map((_,i)=><div key={i} className="bg-white rounded-[26px] h-80 animate-pulse ring-1 ring-[#e8dcbb]"/>)}</div>
          ) : items.length===0 ? (
            <div className="text-center py-20 bg-white rounded-[32px] ring-1 ring-[#e8dcbb]">
              <Bird className="mx-auto text-[#c9a227]" size={52}/>
              <h3 className="font-black text-xl text-[#0b3d2e] mt-4">پرنده‌ای با این مشخصات پیدا نشد 🕊️</h3>
              <p className="text-gray-500 text-sm mt-2">فیلترها را کمتر کنید یا عبارت دیگری جستجو کنید.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{items.map(it=><ListingCard key={it.id} item={it}/>)}</div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setFiltersOpen(false)}/>
          <div className="absolute bottom-0 right-0 left-0 bg-[#fffdf6] rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto animate-fadeUp">
            <div className="flex justify-between items-center mb-4"><h3 className="font-black text-[#0b3d2e]">فیلترها</h3><button onClick={()=>setFiltersOpen(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"><X size={18}/></button></div>
            {Filters}
            <button onClick={()=>setFiltersOpen(false)} className="w-full mt-5 bg-[#0b3d2e] text-[#e8c766] py-3.5 rounded-full font-black">مشاهده نتایج</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ListingsPage() {
  return <Suspense fallback={<div className="text-center py-20 font-bold">در حال بارگذاری طوقی...</div>}><ListingsInner/></Suspense>;
}
