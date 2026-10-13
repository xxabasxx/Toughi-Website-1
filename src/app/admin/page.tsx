"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import { formatPrice, type ListingT, type CategoryT } from "@/lib/client";
import { LayoutDashboard, FileText, Image as ImageIcon, ListChecks, FolderOpen, Settings as SettingsIcon, Lock, Crown, Trash2, Pencil, Eye, MessageSquare, Plus, Check, X, Bird, Save, LogOut, ExternalLink } from "lucide-react";

type S = Record<string,string>;
const PRESET_IMAGES = ["/images/hero-pigeon.jpg","/images/pigeon-pair.jpg","/images/aviary.jpg",
"https://images.pexels.com/photos/30360571/pexels-photo-30360571.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
"https://images.pexels.com/photos/28578824/pexels-photo-28578824.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
"https://images.pexels.com/photos/31238370/pexels-photo-31238370.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
"https://images.pexels.com/photos/11994863/pexels-photo-11994863.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [settings, setSettings] = useState<S>({});
  const [listings, setListings] = useState<ListingT[]>([]);
  const [cats, setCats] = useState<CategoryT[]>([]);
  const [stats, setStats] = useState<{listings:number;active:number;featured:number;views:number;categories:number;inquiriesCount:number;recentInquiries:{id:number;name:string;phone:string;message:string;listingId:number|null;createdAt:string}[]}|null>(null);
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<ListingT | null>(null);
  const [aq, setAq] = useState("");
  const [newCat, setNewCat] = useState({ name:"", icon:"🕊️", image:"", description:"" });
  const [catImgs, setCatImgs] = useState<Record<number, string>>({});

  const notify = (t:string) => { setToast(t); setTimeout(()=>setToast(""),2800); };
  useEffect(()=>{ if (sessionStorage.getItem("toghi-admin")==="1") setAuthed(true); }, []);

  const loadAll = async () => {
    const [s,l,c,st] = await Promise.all([
      fetch("/api/settings").then(r=>r.json()), fetch("/api/listings?all=1").then(r=>r.json()),
      fetch("/api/categories").then(r=>r.json()), fetch("/api/admin").then(r=>r.json()),
    ]);
    setSettings(s); setListings(Array.isArray(l)?l:[]); setCats(Array.isArray(c)?c:[]); setStats(st);
  };
  useEffect(()=>{ if (authed) loadAll(); }, [authed]);

  const login = async () => {
    const r = await fetch("/api/admin", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ password: pwd }) });
    if (r.ok) { sessionStorage.setItem("toghi-admin","1"); setAuthed(true); } else setLoginErr("رمز اشتباه است — رمز پیش‌فرض: toghi123");
  };
  const saveSettings = async (partial?: S) => {
    await fetch("/api/settings", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(partial || settings) });
    notify("✅ تغییرات زنده ذخیره شد — همین حالا در سایت اعمال شد!");
  };
  const setS = (k:string,v:string) => setSettings(s=>({ ...s, [k]:v }));
  const patchListing = async (id:number, patch:Partial<ListingT>) => {
    await fetch(`/api/listings/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify(patch) });
    setListings(ls=>ls.map(x=>x.id===id?{...x,...patch}:x));
  };
  const deleteListing = async (id:number) => {
    if (!confirm("این آگهی کاملاً حذف شود؟")) return;
    await fetch(`/api/listings/${id}`, { method:"DELETE" }); setListings(ls=>ls.filter(x=>x.id!==id)); notify("آگهی حذف شد");
  };
  const saveEditing = async () => {
    if (!editing) return;
    await patchListing(editing.id, editing); setEditing(null); notify("آگهی ویرایش و زنده شد ✅");
  };
  const addCat = async () => {
    if (!newCat.name) return notify("نام دسته را بنویسید");
    const r = await fetch("/api/categories", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(newCat) });
    if (r.ok) { setNewCat({name:"",icon:"🕊️",image:"",description:""}); const c = await fetch("/api/categories").then(x=>x.json()); setCats(c); notify("دسته جدید ساخته شد ✅"); }
  };
  const deleteCat = async (id:number) => { if(!confirm("این دسته حذف شود؟")) return; await fetch(`/api/categories?id=${id}`,{method:"DELETE"}); setCats(cs=>cs.filter(x=>x.id!==id)); };

  if (!authed) return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white rounded-[32px] ring-1 ring-[#e8dcbb] lux-shadow p-8 text-center animate-fadeUp">
        <span className="w-20 h-20 bg-[#062e22] ring-4 ring-[#c9a227]/40 rounded-full flex items-center justify-center mx-auto"><Lock className="text-[#e8c766]" size={32}/></span>
        <h1 className="text-2xl font-black text-[#0b3d2e] mt-5">پنل مدیریت طوقی</h1>
        <p className="text-sm text-gray-500 mt-2 leading-6">از اینجا همه متن‌ها و عکس‌های سایت را <b className="text-[#b48a12]">زنده و بدون کدنویسی</b> ویرایش کنید.</p>
        <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="رمز عبور مدیر" className="w-full mt-6 bg-[#faf6ec] ring-1 ring-[#e8dcbb] rounded-2xl px-4 py-3.5 text-center font-bold"/>
        {loginErr && <p className="text-red-500 text-xs font-bold mt-2">{loginErr}</p>}
        <button onClick={login} className="w-full mt-4 bg-gradient-to-l from-[#0b3d2e] to-[#14532d] text-white py-4 rounded-full font-black">ورود به پنل مدیریت</button>
        <p className="text-xs text-gray-400 mt-4 bg-[#faf6ec] rounded-2xl py-3 font-semibold">رمز پیش‌فرض: <b dir="ltr" className="text-[#b48a12]">toghi123</b> — بعد از ورود از بخش «تنظیمات» عوضش کنید.</p>
      </div>
    </div>
  );

  const inputCls = "w-full bg-white ring-1 ring-[#e8dcbb] rounded-2xl px-4 py-3 text-sm font-semibold";
  const labelCls = "block text-[13px] font-black text-[#0b3d2e] mb-1.5";
  const tabs = [
    { id:"dashboard", label:"داشبورد", icon:LayoutDashboard }, { id:"texts", label:"ویرایش متن‌های سایت", icon:FileText },
    { id:"images", label:"ویرایش عکس‌های سایت", icon:ImageIcon }, { id:"listings", label:"مدیریت آگهی‌ها", icon:ListChecks },
    { id:"cats", label:"دسته‌بندی‌ها", icon:FolderOpen }, { id:"settings", label:"تنظیمات و رمز", icon:SettingsIcon },
  ];
  const filteredListings = listings.filter(l=>!aq || l.title.includes(aq) || l.city.includes(aq) || l.sellerName.includes(aq));

  const TextField = ({ k, label, area=false }: { k:string; label:string; area?:boolean }) => (
    <div>
      <label className={labelCls}>{label}</label>
      {area ? <textarea value={settings[k]||""} onChange={e=>setS(k,e.target.value)} rows={4} className={`${inputCls} leading-7 resize-y`}/>
      : <input value={settings[k]||""} onChange={e=>setS(k,e.target.value)} className={inputCls}/>}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0b3d2e] flex items-center gap-2"><LayoutDashboard className="text-[#c9a227]"/> پنل مدیریت زنده‌ی طوقی</h1>
          <p className="text-sm text-gray-500 mt-1">هر تغییری اینجا بدهید، همان لحظه در سایت منتشر می‌شود — بدون نیاز به آپلود دوباره.</p>
        </div>
        <div className="mr-auto flex gap-2">
          <Link href="/" className="flex items-center gap-1.5 bg-white ring-1 ring-[#e8dcbb] px-4 py-2.5 rounded-full text-sm font-black text-[#0b3d2e]"><ExternalLink size={15}/> مشاهده سایت</Link>
          <Link href="/post" className="flex items-center gap-1.5 bg-[#c9a227] text-[#062e22] px-4 py-2.5 rounded-full text-sm font-black"><Plus size={15}/> آگهی جدید</Link>
          <button onClick={()=>{sessionStorage.removeItem("toghi-admin");setAuthed(false);}} className="flex items-center gap-1.5 bg-red-50 text-red-600 ring-1 ring-red-200 px-4 py-2.5 rounded-full text-sm font-black"><LogOut size={15}/> خروج</button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-5">
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-black transition ${tab===t.id?"bg-[#0b3d2e] text-[#e8c766] shadow-lg":"bg-white ring-1 ring-[#e8dcbb] text-[#0b3d2e] hover:ring-[#c9a227]"}`}><t.icon size={17}/>{t.label}</button>
        ))}
      </div>

      {tab==="dashboard" && stats && (
        <div className="space-y-5 animate-fadeUp">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[{n:stats.listings,l:"کل آگهی‌ها",i:ListChecks},{n:stats.active,l:"آگهی فعال",i:Check},{n:stats.featured,l:"ویژه طلایی",i:Crown},{n:stats.views,l:"مجموع بازدید",i:Eye}].map((x,i)=>(
              <div key={i} className="bg-white rounded-[26px] ring-1 ring-[#e8dcbb] p-6 lux-shadow"><x.i className="text-[#c9a227]" size={26}/><p className="text-3xl font-black text-[#0b3d2e] mt-3">{x.n.toLocaleString("fa-IR")}</p><p className="text-sm text-gray-500 font-bold mt-1">{x.l}</p></div>
            ))}
          </div>
          <div className="bg-white rounded-[28px] ring-1 ring-[#e8dcbb] p-6 lux-shadow">
            <h3 className="font-black text-[#0b3d2e] flex items-center gap-2"><MessageSquare className="text-[#c9a227]"/> پیام‌های خریداران ({stats.inquiriesCount.toLocaleString("fa-IR")})</h3>
            {stats.recentInquiries.length===0 ? <p className="text-sm text-gray-400 mt-4 font-semibold">هنوز پیامی نیامده است. پیام‌های فرم «پیام به فروشنده» اینجا نمایش داده می‌شوند.</p> :
            <div className="space-y-3 mt-4">{stats.recentInquiries.map(m=>(
              <div key={m.id} className="bg-[#faf6ec] ring-1 ring-[#efe3c2] rounded-2xl p-4">
                <div className="flex flex-wrap gap-2 text-sm"><b className="text-[#0b3d2e]">{m.name}</b>{m.phone && <span dir="ltr" className="text-gray-500 font-bold">{m.phone}</span>}{m.listingId && <Link href={`/listings/${m.listingId}`} className="text-[#b48a12] font-black text-xs bg-white px-2 py-0.5 rounded-full ring-1 ring-[#e8dcbb]">آگهی T-{m.listingId}</Link>}<span className="mr-auto text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString("fa-IR")}</span></div>
                <p className="text-sm text-gray-600 leading-7 mt-1.5">{m.message}</p>
              </div>))}
            </div>}
          </div>
        </div>
      )}

      {tab==="texts" && (
        <div className="bg-white rounded-[28px] ring-1 ring-[#e8dcbb] p-6 md:p-8 lux-shadow space-y-7 animate-fadeUp">
          <section><h3 className="font-black text-lg text-[#0b3d2e] mb-4">🏠 بخش اصلی بالای سایت (هیرو)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <TextField k="siteName" label="نام سایت"/><TextField k="tagline" label="شعار سایت"/>
              <TextField k="heroBadge" label="متن برچسب طلایی بالای تیتر"/><TextField k="announcement" label="نوار اطلاع‌رسانی بالای سایت"/>
              <TextField k="heroTitle" label="تیتر اصلی (خط اول)"/><TextField k="heroTitleGold" label="تیتر طلایی (خط دوم)"/>
              <div className="md:col-span-2"><TextField k="heroSubtitle" label="متن توضیح زیر تیتر" area/></div>
              <TextField k="heroStat1Num" label="عدد آمار ۱"/><TextField k="heroStat1Label" label="برچسب آمار ۱"/>
              <TextField k="heroStat2Num" label="عدد آمار ۲"/><TextField k="heroStat2Label" label="برچسب آمار ۲"/>
              <TextField k="heroStat3Num" label="عدد آمار ۳"/><TextField k="heroStat3Label" label="برچسب آمار ۳"/>
            </div>
          </section>
          <section><h3 className="font-black text-lg text-[#0b3d2e] mb-4">✨ مزیت‌های طوقی (۴ کارت وسط صفحه)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <TextField k="feature1Title" label="عنوان مزیت ۱"/><TextField k="feature1Text" label="توضیح مزیت ۱"/>
              <TextField k="feature2Title" label="عنوان مزیت ۲"/><TextField k="feature2Text" label="توضیح مزیت ۲"/>
              <TextField k="feature3Title" label="عنوان مزیت ۳"/><TextField k="feature3Text" label="توضیح مزیت ۳"/>
              <TextField k="feature4Title" label="عنوان مزیت ۴"/><TextField k="feature4Text" label="توضیح مزیت ۴"/>
            </div>
          </section>
          <section><h3 className="font-black text-lg text-[#0b3d2e] mb-4">📖 درباره، راهنما و دعوت پایانی</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <TextField k="aboutTitle" label="عنوان بخش «درباره طوقی»"/>
              <TextField k="guideTitle" label="عنوان راهنمای خرید امن"/>
              <div className="md:col-span-2"><TextField k="aboutText" label="متن کامل درباره طوقی" area/></div>
              <div className="md:col-span-2"><TextField k="guideText" label="متن راهنمای خرید امن" area/></div>
              <TextField k="ctaTitle" label="تیتر بخش پایانی (CTA)"/><TextField k="ctaText" label="متن بخش پایانی"/>
            </div>
          </section>
          <button onClick={()=>saveSettings()} className="sticky bottom-4 w-full bg-gradient-to-l from-[#c9a227] to-[#e8c766] text-[#062e22] py-4 rounded-full font-black shadow-2xl flex items-center justify-center gap-2 hover:scale-[1.01] transition"><Save size={19}/> ذخیره و انتشار زنده‌ی متن‌ها</button>
        </div>
      )}

      {tab==="images" && (
        <div className="space-y-5 animate-fadeUp">
          <div className="bg-white rounded-[28px] ring-1 ring-[#e8dcbb] p-6 md:p-8 lux-shadow space-y-6">
            <h3 className="font-black text-lg text-[#0b3d2e]">🖼️ عکس‌های اصلی سایت</h3>
            <ImageUpload label="عکس اول و اصلی سایت — کبوتر تزئینی پا‌پر و گردن‌فر (پس‌زمینه هیرو)" value={settings.heroImage||""} onChange={v=>{setS("heroImage",v); saveSettings({...settings, heroImage:v});}}/>
            <ImageUpload label="عکس بخش «درباره طوقی»" value={settings.aboutImage||""} onChange={v=>{setS("aboutImage",v); saveSettings({...settings, aboutImage:v});}}/>
            <button onClick={()=>saveSettings()} className="bg-[#0b3d2e] text-[#e8c766] px-6 py-3.5 rounded-full font-black text-sm flex items-center gap-2"><Save size={16}/> ذخیره عکس‌ها</button>
          </div>
          <div className="bg-white rounded-[28px] ring-1 ring-[#e8dcbb] p-6 lux-shadow">
            <h3 className="font-black text-[#0b3d2e] mb-1">گالری آماده‌ی طوقی — با یک کلیک انتخاب کنید</h3>
            <p className="text-xs text-gray-400 font-semibold mb-4">برای عکس اصلی سایت روی هر عکس کلیک کنید.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRESET_IMAGES.map(u=>(
                <button key={u} onClick={()=>{setS("heroImage",u); saveSettings({...settings, heroImage:u});}} className={`relative rounded-3xl overflow-hidden ring-2 transition ${settings.heroImage===u?"ring-[#c9a227] scale-[1.02]":"ring-transparent hover:ring-[#c9a227]/60"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="" className="w-full h-32 object-cover"/>
                  {settings.heroImage===u && <span className="absolute top-2 right-2 bg-[#c9a227] text-[#062e22] text-[10px] font-black px-2 py-1 rounded-full">عکس اصلی فعلی ✓</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-[28px] ring-1 ring-[#e8dcbb] p-6 lux-shadow">
            <h3 className="font-black text-[#0b3d2e] mb-1">عکس دسته‌بندی‌ها</h3>
            <p className="text-xs text-gray-400 font-semibold mb-5">عکس هر دسته را آپلود یا با لینک عوض کنید و دکمه ذخیره همان دسته را بزنید — بلافاصله در صفحه اصلی عوض می‌شود.</p>
            <div className="space-y-7">
              {cats.map(c=>(
                <div key={c.id} className="border-b border-dashed border-[#e8dcbb] pb-6 last:border-0">
                  <ImageUpload label={`${c.icon} ${c.name}`} value={catImgs[c.id] ?? c.image ?? ""} onChange={v=>setCatImgs(m=>({ ...m, [c.id]: v }))}/>
                  <button onClick={async()=>{ const img = catImgs[c.id] ?? c.image; if (img===c.image) return notify("عکس جدیدی انتخاب نشده"); await fetch("/api/categories",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:c.id,image:img})}); setCats(cs=>cs.map(x=>x.id===c.id?{...x,image:img}:x)); notify(`عکس دسته «${c.name}» زنده شد ✅`); }} className="mt-3 bg-[#0b3d2e] text-[#e8c766] px-5 py-2.5 rounded-full font-black text-xs flex items-center gap-1.5"><Save size={14}/> ذخیره عکس این دسته</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="listings" && (
        <div className="bg-white rounded-[28px] ring-1 ring-[#e8dcbb] p-5 md:p-7 lux-shadow animate-fadeUp">
          <div className="flex flex-wrap gap-3 items-center mb-5">
            <h3 className="font-black text-lg text-[#0b3d2e]">همه آگهی‌ها ({filteredListings.length.toLocaleString("fa-IR")})</h3>
            <input value={aq} onChange={e=>setAq(e.target.value)} placeholder="جستجو در آگهی‌ها..." className="flex-1 min-w-[200px] bg-[#faf6ec] ring-1 ring-[#e8dcbb] rounded-full px-5 py-3 text-sm font-semibold"/>
            <Link href="/post" className="bg-[#0b3d2e] text-[#e8c766] px-5 py-3 rounded-full text-sm font-black flex items-center gap-1"><Plus size={15}/> آگهی جدید</Link>
          </div>
          <div className="space-y-3">
            {filteredListings.map(l=>(
              <div key={l.id} className="flex flex-wrap items-center gap-3 bg-[#fffdf6] ring-1 ring-[#e8dcbb] rounded-3xl p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.image} alt="" className="w-20 h-16 object-cover rounded-2xl shrink-0"/>
                <div className="flex-1 min-w-[180px]">
                  <Link href={`/listings/${l.id}`} className="font-black text-sm text-[#0b3d2e] line-clamp-1 hover:text-[#b48a12]">{l.title}</Link>
                  <p className="text-xs text-gray-400 font-semibold mt-1">{l.city} • {l.sellerName} • {formatPrice(l.price)} • {(l.views||0).toLocaleString("fa-IR")} بازدید</p>
                </div>
                <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${l.status==="active"?"bg-emerald-100 text-emerald-700":l.status==="sold"?"bg-gray-200 text-gray-500":"bg-amber-100 text-amber-700"}`}>{l.status==="active"?"فعال":l.status==="sold"?"فروخته شد":"مخفی"}</span>
                <button onClick={()=>patchListing(l.id,{featured:!l.featured})} title="ویژه طلایی" className={`w-10 h-10 rounded-full flex items-center justify-center ring-1 ${l.featured?"bg-[#c9a227] text-[#062e22] ring-[#c9a227]":"bg-white ring-[#e8dcbb] text-gray-400"}`}><Crown size={17}/></button>
                <button onClick={()=>patchListing(l.id,{status:l.status==="active"?"hidden":"active"})} title="نمایش/مخفی" className="w-10 h-10 rounded-full bg-white ring-1 ring-[#e8dcbb] flex items-center justify-center text-gray-500"><Eye size={17}/></button>
                <button onClick={()=>setEditing({...l})} className="w-10 h-10 rounded-full bg-[#0b3d2e] text-[#e8c766] flex items-center justify-center"><Pencil size={16}/></button>
                <button onClick={()=>deleteListing(l.id)} className="w-10 h-10 rounded-full bg-red-50 text-red-500 ring-1 ring-red-200 flex items-center justify-center"><Trash2 size={16}/></button>
              </div>
            ))}
            {filteredListings.length===0 && <p className="text-center text-gray-400 font-bold py-10">آگهی‌ای پیدا نشد.</p>}
          </div>
        </div>
      )}

      {tab==="cats" && (
        <div className="space-y-5 animate-fadeUp">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cats.map(c=>(
              <div key={c.id} className="relative rounded-[26px] overflow-hidden ring-1 ring-[#e8dcbb] h-44 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image||"/images/hero-pigeon.jpg"} alt="" className="absolute inset-0 w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#062e22]/95 to-transparent"/>
                <button onClick={()=>deleteCat(c.id)} className="absolute top-3 left-3 w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center shadow"><Trash2 size={15}/></button>
                <div className="absolute bottom-0 p-4 text-white"><p className="font-black">{c.icon} {c.name}</p><p className="text-[11px] text-emerald-100/75 line-clamp-1">{c.description}</p><p className="text-[11px] mt-1 text-[#e8c766] font-bold">{((c as CategoryT & {count?:number}).count||0).toLocaleString("fa-IR")} آگهی</p></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-[28px] ring-1 ring-[#e8dcbb] p-6 md:p-8 lux-shadow">
            <h3 className="font-black text-lg text-[#0b3d2e] mb-4">➕ ساخت دسته‌بندی جدید</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className={labelCls}>نام دسته *</label><input value={newCat.name} onChange={e=>setNewCat({...newCat,name:e.target.value})} placeholder="مثال: کبوتر نامه‌بر" className={inputCls}/></div>
              <div><label className={labelCls}>آیکون (ایموجی)</label><input value={newCat.icon} onChange={e=>setNewCat({...newCat,icon:e.target.value})} className={inputCls}/></div>
              <div className="md:col-span-2"><label className={labelCls}>توضیح کوتاه دسته</label><input value={newCat.description} onChange={e=>setNewCat({...newCat,description:e.target.value})} className={inputCls}/></div>
              <div className="md:col-span-2"><ImageUpload label="عکس دسته‌بندی" value={newCat.image} onChange={v=>setNewCat({...newCat,image:v})}/></div>
            </div>
            <button onClick={addCat} className="mt-5 bg-[#0b3d2e] text-[#e8c766] px-7 py-3.5 rounded-full font-black text-sm">ساخت دسته و انتشار در سایت</button>
          </div>
        </div>
      )}

      {tab==="settings" && (
        <div className="bg-white rounded-[28px] ring-1 ring-[#e8dcbb] p-6 md:p-8 lux-shadow space-y-5 animate-fadeUp">
          <h3 className="font-black text-lg text-[#0b3d2e]">⚙️ اطلاعات تماس و فوتر سایت</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <TextField k="contactPhone" label="شماره تماس پشتیبانی"/><TextField k="contactEmail" label="ایمیل سایت"/>
            <TextField k="contactAddress" label="آدرس"/><TextField k="adminPassword" label="رمز عبور پنل مدیریت"/>
            <div className="md:col-span-2"><TextField k="footerText" label="متن فوتر (پایین سایت)" area/></div>
          </div>
          <div className="bg-amber-50 ring-1 ring-amber-200 rounded-3xl p-5 text-sm leading-7 text-amber-800 font-semibold">
            <b>نکته انتشار روی گیت‌هاب و کلودفلر:</b> سایت طوقی با Next.js ساخته شده و آماده‌ی اتصال به گیت‌هاب است. برای انتشار: پروژه را در یک ریپوی گیت‌هاب آپلود کنید، سپس در Cloudflare Pages آن را ایمپورت کنید. چون سایت از دیتابیس و آپلود عکس استفاده می‌کند، برای اجرای کامل (ثبت آگهی و پنل زنده) یک سرور Node یا سرویس ابری دیتابیس (مثل Neon/Supabase) لازم است و آدرس آن را در متغیر DATABASE_URL قرار دهید.
          </div>
          <button onClick={()=>saveSettings()} className="bg-gradient-to-l from-[#c9a227] to-[#e8c766] text-[#062e22] px-8 py-4 rounded-full font-black flex items-center gap-2"><Save size={18}/> ذخیره تنظیمات</button>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={()=>setEditing(null)}/>
          <div className="relative bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] p-6 md:p-8 animate-fadeUp">
            <div className="flex justify-between items-center mb-5"><h3 className="font-black text-lg text-[#0b3d2e] flex items-center gap-2"><Bird className="text-[#c9a227]"/> ویرایش آگهی</h3><button onClick={()=>setEditing(null)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"><X size={18}/></button></div>
            <div className="space-y-4">
              <div><label className={labelCls}>عنوان</label><input value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})} className={inputCls}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>قیمت (تومان)</label><input value={editing.price} onChange={e=>setEditing({...editing,price:Number(e.target.value.replace(/[^0-9]/g,"")||0)})} className={inputCls}/></div>
                <div><label className={labelCls}>شهر</label><input value={editing.city} onChange={e=>setEditing({...editing,city:e.target.value})} className={inputCls}/></div>
                <div><label className={labelCls}>نژاد</label><input value={editing.breed} onChange={e=>setEditing({...editing,breed:e.target.value})} className={inputCls}/></div>
                <div><label className={labelCls}>نام فروشنده</label><input value={editing.sellerName} onChange={e=>setEditing({...editing,sellerName:e.target.value})} className={inputCls}/></div>
                <div><label className={labelCls}>شماره تماس</label><input value={editing.phone} onChange={e=>setEditing({...editing,phone:e.target.value})} className={inputCls}/></div>
                <div><label className={labelCls}>وضعیت</label>
                  <select value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})} className={inputCls}><option value="active">فعال</option><option value="sold">فروخته شد</option><option value="hidden">مخفی</option></select>
                </div>
              </div>
              <div><label className={labelCls}>دسته‌بندی</label>
                <select value={editing.categorySlug} onChange={e=>setEditing({...editing,categorySlug:e.target.value})} className={inputCls}>{cats.map(c=><option key={c.id} value={c.slug}>{c.name}</option>)}</select>
              </div>
              <div><label className={labelCls}>توضیحات</label><textarea value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})} rows={4} className={`${inputCls} leading-7`}/></div>
              <ImageUpload label="عکس اصلی آگهی" value={editing.image} onChange={v=>setEditing({...editing,image:v,images:[v]})}/>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[{k:"featured",l:"👑 ویژه طلایی"},{k:"urgent",l:"⚡ فوری"},{k:"verified",l:"✅ احراز شده"}].map(x=>(
                  <button key={x.k} onClick={()=>setEditing({...editing,[x.k]:!editing[x.k as keyof ListingT]})} className={`py-3 rounded-2xl text-xs font-black ring-2 transition ${editing[x.k as keyof ListingT]?"bg-[#fff8e1] ring-[#c9a227] text-[#0b3d2e]":"bg-gray-50 ring-gray-200 text-gray-400"}`}>{x.l}</button>
                ))}
              </div>
              <button onClick={saveEditing} className="w-full bg-[#0b3d2e] text-[#e8c766] py-4 rounded-full font-black">ذخیره و انتشار زنده</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-28 right-1/2 translate-x-1/2 z-[100] bg-[#062e22] text-white text-sm font-bold px-6 py-3.5 rounded-full shadow-2xl ring-1 ring-[#c9a227]/50 animate-fadeUp whitespace-nowrap">{toast}</div>}
    </div>
  );
}
