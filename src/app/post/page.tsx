"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import type { CategoryT } from "@/lib/client";
import { CITIES } from "@/lib/cities";
import { Bird, Check, Crown, Sparkles, Plus, X, ShieldCheck, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function PostPage() {
  const router = useRouter();
  const [cats, setCats] = useState<CategoryT[]>([]);
  const [authState, setAuthState] = useState<"loading" | "in" | "out">("loading");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [form, setForm] = useState({ title:"", description:"", price:"", categorySlug:"kabootar", city:"تهران", phone:"", sellerName:"", breed:"", age:"", gender:"نامشخص", featured:false, urgent:false });
  const [images, setImages] = useState<string[]>([""]);
  const [err, setErr] = useState("");

  useEffect(()=>{ fetch("/api/categories").then(r=>r.json()).then(setCats).catch(()=>{}); }, []);
  useEffect(()=>{
    apiFetch("/api/auth/me").then(async r=>{
      if (!r.ok) { setAuthState("out"); return; }
      const d = await r.json();
      setForm(f=>({ ...f, sellerName: f.sellerName || d.user.name || "", phone: f.phone || d.user.phone || "", city: d.user.city || f.city }));
      setAuthState("in");
    }).catch(()=>setAuthState("out"));
  }, []);
  const set = (k:string, v:string|boolean) => setForm(f=>({ ...f, [k]: v }));

  const submit = async () => {
    setErr("");
    if (!form.title.trim()) return setErr("عنوان آگهی را بنویسید");
    if (!form.phone.trim()) return setErr("شماره تماس برای خریداران الزامی است");
    setBusy(true);
    const validImages = images.filter(Boolean);
    const r = await apiFetch("/api/listings", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({
      ...form, price: Number(form.price.replace(/[^0-9]/g,"")||0), image: validImages[0]||"", images: validImages,
    })});
    const d = await r.json(); setBusy(false);
    if (r.ok && d.id) setDone(d.id); else setErr(d.error || "خطایی رخ داد، دوباره تلاش کنید");
  };

  if (authState === "loading") return (
    <div className="text-center py-24"><Loader2 className="animate-spin mx-auto text-[#c9a227]" size={38}/><p className="font-bold text-gray-500 mt-3">در حال بررسی ورود شما...</p></div>
  );

  if (authState === "out") return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white rounded-[32px] ring-1 ring-[#e8dcbb] lux-shadow p-8 text-center animate-fadeUp">
        <span className="w-20 h-20 bg-[#062e22] ring-4 ring-[#c9a227]/40 rounded-full flex items-center justify-center mx-auto"><ShieldCheck className="text-[#e8c766]" size={34}/></span>
        <h1 className="text-2xl font-black text-[#0b3d2e] mt-5">اول وارد حسابت شو 🕊️</h1>
        <p className="text-sm text-gray-500 mt-2.5 leading-7">برای ثبت آگهی در طوقی باید با شماره موبایل وارد شوی تا خریدارها به آگهی‌ات اعتماد کنند و آگهی در پنل شخصی‌ات مدیریت شود. فقط ۳۰ ثانیه طول می‌کشد.</p>
        <button onClick={()=>router.push("/login?next=/post")} className="btn-gold mt-6">ورود با شماره موبایل</button>
        <p className="text-[11px] text-gray-400 mt-4 font-semibold">کد تایید پیامکی + احراز هویت با کد ملی = نشان طلایی اعتماد</p>
      </div>
    </div>
  );

  if (done) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <span className="w-24 h-24 bg-gradient-to-br from-[#0b3d2e] to-[#14532d] ring-4 ring-[#c9a227]/40 rounded-full flex items-center justify-center mx-auto animate-fadeUp"><Check className="text-[#e8c766]" size={44}/></span>
      <h1 className="text-3xl font-black text-[#0b3d2e] mt-6">آگهی شما منتشر شد! 🎉</h1>
      <p className="text-gray-500 mt-3 leading-7">پرنده‌ی زیبای شما همین حالا در بازار طوقی دیده می‌شود و هزاران خریدار منتظرش هستند.</p>
      <div className="flex gap-3 justify-center mt-7">
        <button onClick={()=>router.push(`/listings/${done}`)} className="bg-[#0b3d2e] text-[#e8c766] px-6 py-3.5 rounded-full font-black text-sm">مشاهده آگهی من</button>
        <button onClick={()=>{setDone(null); setForm({...form,title:"",description:"",price:""}); setImages([""]);}} className="bg-white ring-1 ring-[#e8dcbb] px-6 py-3.5 rounded-full font-black text-sm text-[#0b3d2e]">ثبت آگهی جدید</button>
      </div>
    </div>
  );

  const inputCls = "w-full bg-white ring-1 ring-[#e8dcbb] rounded-2xl px-4 py-3 text-sm font-semibold";
  const labelCls = "block text-sm font-black text-[#0b3d2e] mb-2";

  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-4">
      <div className="relative overflow-hidden rounded-[32px] bg-[#062e22] px-6 py-9 mb-6 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero-pigeon.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-35"/>
        <div className="absolute inset-0 bg-gradient-to-l from-[#062e22] via-[#062e22]/75 to-transparent"/>
        <div className="relative">
          <p className="text-[#e8c766] font-black text-sm flex items-center gap-1.5"><Sparkles size={16}/> در کمتر از ۲ دقیقه</p>
          <h1 className="text-3xl font-black mt-1.5">ثبت آگهی رایگان در طوقی</h1>
          <p className="text-emerald-100/85 text-sm mt-2">عکس زیبا + توضیح صادقانه = فروش سریع‌تر. آگهی شما فوراً منتشر می‌شود.</p>
        </div>
      </div>

      <div className="bg-white rounded-[30px] ring-1 ring-[#e8dcbb] lux-shadow p-6 md:p-8 space-y-6">
        <div>
          <label className={labelCls}>عنوان آگهی *</label>
          <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="مثال: کبوتر یعقوبی سفید اصل پا‌پر و گردن‌فر" className={inputCls}/>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>دسته‌بندی</label>
            <select value={form.categorySlug} onChange={e=>set("categorySlug",e.target.value)} className={inputCls}>
              {cats.map(c=><option key={c.id} value={c.slug}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>شهر</label>
            <select value={form.city} onChange={e=>set("city",e.target.value)} className={inputCls}>{CITIES.filter(c=>c!=="همه شهرها").map(c=><option key={c}>{c}</option>)}</select>
          </div>
          <div><label className={labelCls}>قیمت (تومان) — صفر = توافقی</label>
            <input value={form.price} onChange={e=>set("price",e.target.value.replace(/[^0-9]/g,""))} placeholder="8500000" inputMode="numeric" className={inputCls}/>
            {form.price && <p className="text-xs text-[#b48a12] font-black mt-1.5">{Number(form.price).toLocaleString("fa-IR")} تومان</p>}
          </div>
          <div><label className={labelCls}>نژاد / گونه</label><input value={form.breed} onChange={e=>set("breed",e.target.value)} placeholder="مثال: یعقوبی، کاسکو، رسمی‌بلند" className={inputCls}/></div>
          <div><label className={labelCls}>سن</label><input value={form.age} onChange={e=>set("age",e.target.value)} placeholder="مثال: ۱ ساله، ۳ ماهه" className={inputCls}/></div>
          <div><label className={labelCls}>جنسیت</label>
            <select value={form.gender} onChange={e=>set("gender",e.target.value)} className={inputCls}><option>نر</option><option>ماده</option><option>جفت نر و ماده</option><option>جفت مولد</option><option>نامشخص</option></select>
          </div>
          <div><label className={labelCls}>نام شما / نام مجموعه</label><input value={form.sellerName} onChange={e=>set("sellerName",e.target.value)} placeholder="مثال: پرورشگاه پرنیان" className={inputCls}/></div>
          <div><label className={labelCls}>شماره تماس *</label><input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="09123456789" inputMode="tel" className={inputCls}/></div>
        </div>

        <div>
          <label className={labelCls}>توضیحات آگهی</label>
          <textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={5} placeholder="از سلامت، اصالت، شناسنامه، نحوه ارسال و هر چیزی که خریدار باید بداند بنویسید..." className={`${inputCls} resize-none leading-7`}/>
        </div>

        <div className="space-y-4">
          {images.map((img,i)=>(
            <div key={i} className="relative">
              <ImageUpload label={i===0?"عکس اصلی آگهی (کاور)":"عکس شماره " + (i+1).toLocaleString("fa-IR")} value={img} onChange={url=>setImages(imgs=>imgs.map((x,j)=>j===i?url:x))}/>
              {images.length>1 && <button type="button" onClick={()=>setImages(images.filter((_,j)=>j!==i))} className="absolute top-8 left-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"><X size={15}/></button>}
            </div>
          ))}
          {images.length<6 && <button type="button" onClick={()=>setImages([...images,""])} className="flex items-center gap-1.5 text-sm font-black text-[#0b3d2e] bg-[#faf6ec] ring-1 ring-dashed ring-[#c9a227] px-4 py-3 rounded-2xl w-full justify-center"><Plus size={17}/> افزودن عکس بیشتر (تا ۶ عکس)</button>}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className={`rounded-3xl p-4 ring-2 cursor-pointer transition ${form.featured?"bg-[#fff8e1] ring-[#c9a227]":"bg-[#faf6ec] ring-[#e8dcbb]"}`}>
            <span className="flex items-center justify-between"><span className="font-black text-[#0b3d2e] flex items-center gap-1.5"><Crown size={18} className="text-[#c9a227]"/> آگهی ویژه طلایی</span><input type="checkbox" checked={form.featured} onChange={e=>set("featured",e.target.checked)} className="w-5 h-5 accent-[#c9a227]" style={{boxShadow:"none"}}/></span>
            <span className="block text-xs text-gray-500 mt-1.5 leading-5">نمایش در گالری ستاره‌های صفحه اصلی و بالای نتایج جستجو — فروش ۵ برابر سریع‌تر!</span>
          </label>
          <label className={`rounded-3xl p-4 ring-2 cursor-pointer transition ${form.urgent?"bg-red-50 ring-red-300":"bg-[#faf6ec] ring-[#e8dcbb]"}`}>
            <span className="flex items-center justify-between"><span className="font-black text-[#0b3d2e]">⚡ فروش فوری</span><input type="checkbox" checked={form.urgent} onChange={e=>set("urgent",e.target.checked)} className="w-5 h-5 accent-red-500" style={{boxShadow:"none"}}/></span>
            <span className="block text-xs text-gray-500 mt-1.5 leading-5">با برچسب «فوری» قرمز مشخص می‌شود تا خریدارها سریع‌تر پیدایت کنند.</span>
          </label>
        </div>

        {err && <p className="bg-red-50 text-red-600 ring-1 ring-red-200 rounded-2xl px-4 py-3 text-sm font-bold">{err}</p>}
        <button onClick={submit} disabled={busy} className="w-full bg-gradient-to-l from-[#0b3d2e] to-[#14532d] text-white py-4.5 py-4 rounded-full font-black text-base shadow-xl shadow-emerald-900/25 hover:scale-[1.01] transition disabled:opacity-60 flex items-center justify-center gap-2">
          <Bird size={21} className="text-[#e8c766]"/> {busy?"در حال انتشار...":"انتشار رایگان آگهی من"}
        </button>
        <p className="text-center text-[11px] text-gray-400 font-semibold">با انتشار آگهی، قوانین طوقی و حریم خصوصی را می‌پذیرید. فروش حیوانات حمایت‌شده و غیرقانونی ممنوع است.</p>
      </div>
    </div>
  );
}
