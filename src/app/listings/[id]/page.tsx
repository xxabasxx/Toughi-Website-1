"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { formatPrice, timeAgo, type ListingT } from "@/lib/client";
import { Heart, MapPin, Eye, Phone, ShieldCheck, BadgeCheck, Share2, Flag, Bird, Check, Send, ChevronRight } from "lucide-react";

type Detail = ListingT & { related?: ListingT[] };

export default function DetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<Detail | null>(null);
  const [showPhone, setShowPhone] = useState(false);
  const [fav, setFav] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [toast, setToast] = useState("");
  const [msg, setMsg] = useState({ name:"", phone:"", message:"" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`/api/listings/${id}`).then(r=>r.json()).then(setItem).catch(()=>{});
    try { setFav(JSON.parse(localStorage.getItem("toghi-favs")||"[]").includes(Number(id))); } catch {}
  }, [id]);

  if (!item) return <div className="max-w-5xl mx-auto px-4 py-24 text-center"><Bird className="mx-auto text-[#c9a227] animate-bounce" size={48}/><p className="font-bold text-gray-500 mt-3">در حال آوردن این پرنده زیبا...</p></div>;

  const gallery = Array.from(new Set([item.image, ...((item.images as string[])||[])].filter(Boolean)));
  const toggleFav = () => {
    let arr: number[] = []; try { arr = JSON.parse(localStorage.getItem("toghi-favs")||"[]"); } catch {}
    arr = fav ? arr.filter(x=>x!==item.id) : [...arr, item.id];
    localStorage.setItem("toghi-favs", JSON.stringify(arr)); setFav(!fav);
    window.dispatchEvent(new Event("toghi-fav"));
    setToast(fav ? "از نشان‌شده‌ها حذف شد" : "به نشان‌شده‌ها اضافه شد ❤️"); setTimeout(()=>setToast(""),2500);
  };
  const share = async () => {
    try { await navigator.share({ title:item.title, url:location.href }); } catch {
      try { await navigator.clipboard.writeText(location.href); setToast("لینک آگهی کپی شد 🔗"); setTimeout(()=>setToast(""),2500); } catch {}
    }
  };
  const sendMsg = async () => {
    if (!msg.name || !msg.message) { setToast("نام و پیام را کامل بنویسید"); setTimeout(()=>setToast(""),2500); return; }
    const r = await fetch("/api/inquiries", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ ...msg, listingId:item.id }) });
    if (r.ok) { setSent(true); setMsg({name:"",phone:"",message:""}); }
  };

  const specs = [
    { k:"نژاد / گونه", v:item.breed || "—" }, { k:"سن", v:item.age || "—" }, { k:"جنسیت", v:item.gender || "—" },
    { k:"شهر", v:item.city }, { k:"وضعیت", v:item.status==="sold"?"فروخته شده":"موجود و آماده تحویل" },
    { k:"شناسه آگهی", v:`T-${item.id.toLocaleString("fa-IR")}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
      <nav className="flex items-center gap-1 text-xs text-gray-500 font-semibold mb-5 flex-wrap">
        <Link href="/" className="hover:text-[#0b3d2e]">طوقی</Link><ChevronRight size={13}/>
        <Link href="/listings" className="hover:text-[#0b3d2e]">آگهی‌ها</Link><ChevronRight size={13}/>
        <span className="text-[#0b3d2e] font-black line-clamp-1">{item.title}</span>
      </nav>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
        <div>
          <div className="relative rounded-[32px] overflow-hidden ring-2 ring-[#c9a227]/40 shadow-2xl bg-[#062e22]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gallery[imgIdx]} alt={item.title} className="w-full h-[340px] md:h-[520px] object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"/>
            {item.featured && <span className="absolute top-4 right-4 bg-gradient-to-l from-[#c9a227] to-[#e8c766] text-[#062e22] text-xs font-black px-3.5 py-1.5 rounded-full shadow">👑 آگهی ویژه طلایی</span>}
            <span className="absolute bottom-4 right-4 text-white text-xs font-bold bg-black/40 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5"><Eye size={14}/> {(item.views||0).toLocaleString("fa-IR")} بازدید • {timeAgo(item.createdAt)}</span>
          </div>
          {gallery.length>1 && (
            <div className="flex gap-2.5 mt-3 overflow-x-auto no-scrollbar pb-1">
              {gallery.map((g,i)=>(
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={g} onClick={()=>setImgIdx(i)} alt="" className={`w-24 h-[70px] object-cover rounded-2xl cursor-pointer ring-2 transition ${i===imgIdx?"ring-[#c9a227] scale-[1.03]":"ring-transparent opacity-70 hover:opacity-100"}`}/>
              ))}
            </div>
          )}

          <div className="bg-white rounded-[28px] ring-1 ring-[#e8dcbb] p-6 mt-5 lux-shadow">
            <h2 className="font-black text-[#0b3d2e] text-lg mb-4">مشخصات پرنده</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {specs.map(s=>(
                <div key={s.k} className="bg-[#faf6ec] rounded-2xl px-4 py-3.5 ring-1 ring-[#efe3c2]"><p className="text-[11px] text-gray-400 font-bold">{s.k}</p><p className="font-black text-sm text-[#14201b] mt-1">{s.v}</p></div>
              ))}
            </div>
            <h2 className="font-black text-[#0b3d2e] text-lg mt-7 mb-3">توضیحات فروشنده</h2>
            <p className="text-gray-600 leading-9 text-[15px] whitespace-pre-line">{item.description}</p>
            <div className="grid sm:grid-cols-3 gap-3 mt-6">
              {["فیلم روز پرنده قبل از خرید","برگه سلامت دامپزشکی","ارسال امن به سراسر ایران"].map(t=>(
                <span key={t} className="flex items-center gap-2 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100 rounded-2xl px-3.5 py-3 text-xs font-black"><Check size={16} className="text-[#c9a227] shrink-0"/>{t}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[28px] ring-1 ring-[#e8dcbb] p-6 mt-5 lux-shadow">
            <h2 className="font-black text-[#0b3d2e]">💬 پیام به فروشنده</h2>
            {sent ? (
              <div className="text-center py-8"><span className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"><Check className="text-emerald-700" size={30}/></span><p className="font-black text-emerald-800 mt-3">پیام شما با موفقیت ارسال شد!</p><p className="text-sm text-gray-500 mt-1">فروشنده به‌زودی با شما تماس می‌گیرد.</p></div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <input value={msg.name} onChange={e=>setMsg({...msg,name:e.target.value})} placeholder="نام شما *" className="bg-[#faf6ec] ring-1 ring-[#e8dcbb] rounded-2xl px-4 py-3 text-sm"/>
                <input value={msg.phone} onChange={e=>setMsg({...msg,phone:e.target.value})} placeholder="شماره تماس شما" className="bg-[#faf6ec] ring-1 ring-[#e8dcbb] rounded-2xl px-4 py-3 text-sm"/>
                <textarea value={msg.message} onChange={e=>setMsg({...msg,message:e.target.value})} placeholder={`سلام، درباره «${item.title.slice(0,30)}...» سؤال داشتم *`} rows={3} className="sm:col-span-2 bg-[#faf6ec] ring-1 ring-[#e8dcbb] rounded-2xl px-4 py-3 text-sm resize-none"/>
                <button onClick={sendMsg} className="sm:col-span-2 bg-[#0b3d2e] text-[#e8c766] py-3.5 rounded-full font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.01] transition"><Send size={16}/> ارسال پیام</button>
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-36 space-y-4">
          <div className="bg-white rounded-[28px] ring-1 ring-[#e8dcbb] p-6 lux-shadow">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl font-black leading-8 text-[#14201b]">{item.title}</h1>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold mt-2"><MapPin size={15} className="text-[#c9a227]"/>{item.city} • {timeAgo(item.createdAt)}</p>
            <div className="flex items-center justify-between mt-5 bg-gradient-to-l from-[#faf6ec] to-white ring-1 ring-[#e8dcbb] rounded-3xl px-5 py-4">
              <span className="text-xs font-black text-gray-400">قیمت</span>
              <span className="text-2xl font-black text-[#0b3d2e]">{formatPrice(item.price)}</span>
            </div>
            <button onClick={()=>setShowPhone(true)} className="w-full mt-4 bg-gradient-to-l from-[#0b3d2e] to-[#14532d] text-white py-4 rounded-full font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 hover:scale-[1.02] transition">
              <Phone size={19} className="text-[#e8c766]"/> {showPhone ? <span dir="ltr" className="tracking-wider">{item.phone}</span> : "نمایش شماره فروشنده"}
            </button>
            {showPhone && <a href={`tel:${item.phone}`} className="block text-center text-xs font-black text-emerald-700 mt-2">📞 برای تماس ضربه بزنید</a>}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button onClick={toggleFav} className={`py-3 rounded-2xl text-xs font-black ring-1 flex flex-col items-center gap-1 transition ${fav?"bg-[#c9a227] text-[#062e22] ring-[#c9a227]":"bg-white ring-[#e8dcbb] text-[#0b3d2e]"}`}><Heart size={17} fill={fav?"currentColor":"none"}/>نشان کردن</button>
              <button onClick={share} className="py-3 rounded-2xl text-xs font-black ring-1 bg-white ring-[#e8dcbb] text-[#0b3d2e] flex flex-col items-center gap-1"><Share2 size={17}/>اشتراک</button>
              <button onClick={()=>{setToast("گزارش شما ثبت شد و بررسی می‌شود 🚩");setTimeout(()=>setToast(""),2500);}} className="py-3 rounded-2xl text-xs font-black ring-1 bg-white ring-[#e8dcbb] text-gray-500 flex flex-col items-center gap-1"><Flag size={17}/>گزارش</button>
            </div>
          </div>

          <div className="bg-[#062e22] rounded-[28px] p-6 text-white relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#c9a227]/25 blur-3xl rounded-full"/>
            <div className="relative flex items-center gap-3.5">
              <span className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c9a227] to-[#8a6d1b] flex items-center justify-center text-xl font-black text-[#062e22] shrink-0">{item.sellerName.slice(0,1)}</span>
              <div>
                <p className="font-black flex items-center gap-1.5">{item.sellerName} {item.verified && <BadgeCheck size={18} className="text-[#e8c766]"/>}</p>
                <p className="text-xs text-emerald-100/70 mt-0.5">{item.verified ? "فروشنده احراز هویت‌شده‌ی طلایی طوقی" : "فروشنده طوقی"}</p>
              </div>
            </div>
            <div className="relative grid grid-cols-2 gap-2 mt-5 text-center">
              <div className="bg-white/8 ring-1 ring-white/10 rounded-2xl py-3"><p className="font-black text-[#e8c766]">۹۸٪</p><p className="text-[11px] text-emerald-100/70 mt-0.5">رضایت خریداران</p></div>
              <div className="bg-white/8 ring-1 ring-white/10 rounded-2xl py-3"><p className="font-black text-[#e8c766]">زیر ۱ ساعت</p><p className="text-[11px] text-emerald-100/70 mt-0.5">میانگین پاسخگویی</p></div>
            </div>
          </div>

          <div className="bg-amber-50 ring-1 ring-amber-200 rounded-[28px] p-5">
            <h3 className="font-black text-amber-800 text-sm flex items-center gap-1.5"><ShieldCheck size={17}/> نکات معامله امن</h3>
            <ul className="text-xs text-amber-700 leading-6 mt-2 space-y-1">
              <li>• قبل از پرداخت، فیلم روز و زنده‌ی پرنده را ببینید.</li>
              <li>• برای مبالغ بالا معامله حضوری انجام دهید.</li>
              <li>• برگه سلامت و حلقه‌ی پای پرنده را بررسی کنید.</li>
            </ul>
          </div>
        </aside>
      </div>

      {item.related && item.related.length>0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-black text-[#0b3d2e] mb-5">پرنده‌های مشابه که عاشقشان می‌شوی</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{item.related.map(r=><ListingCard key={r.id} item={r}/>)}</div>
        </section>
      )}

      {toast && <div className="fixed bottom-28 right-1/2 translate-x-1/2 z-[80] bg-[#062e22] text-white text-sm font-bold px-6 py-3.5 rounded-full shadow-2xl ring-1 ring-[#c9a227]/50 animate-fadeUp">{toast}</div>}
    </div>
  );
}
