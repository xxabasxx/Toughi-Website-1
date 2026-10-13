"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice, type ListingT } from "@/lib/client";
import { PROVINCES, citiesOf, provinceOfCity } from "@/lib/provinces";
import { apiFetch, clearToken } from "@/lib/api";
import { BadgeCheck, Smartphone, ShieldCheck, Eye, ListChecks, Heart, LogOut, PlusCircle, Trash2, EyeOff, Eye as EyeIcon, Check, Pencil, Save, LayoutDashboard, Bird, Loader2 } from "lucide-react";

type User = { id: number; name: string; phone: string; province: string; city: string; phoneVerified: boolean; identityVerified: boolean; hasNationalCode: boolean; nationalCodeMasked: string };

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [myListings, setMyListings] = useState<ListingT[]>([]);
  const [loading, setLoading] = useState(true);
  const [favCount, setFavCount] = useState(0);
  const [edit, setEdit] = useState({ name: "", province: "تهران", city: "تهران", nationalCode: "" });
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  const notify = (t: string) => { setToast(t); setTimeout(() => setToast(""), 2800); };

  useEffect(() => {
    apiFetch("/api/auth/me").then(async r => {
      if (!r.ok) { router.replace("/login?next=/account"); return; }
      const d = await r.json();
      const prov = d.user.province || provinceOfCity(d.user.city || "تهران");
      setUser(d.user); setEdit({ name: d.user.name, province: prov, city: d.user.city || citiesOf(prov)[0] || "تهران", nationalCode: "" });
      const ml = await apiFetch("/api/auth/my-listings").then(x => x.json()).catch(() => []);
      setMyListings(Array.isArray(ml) ? ml : []);
      try { setFavCount(JSON.parse(localStorage.getItem("toghi-favs") || "[]").length); } catch {}
      setLoading(false);
    }).catch(() => router.replace("/login?next=/account"));
  }, [router]);

  const logout = async () => {
    clearToken();
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/"); router.refresh();
  };

  const saveProfile = async () => {
    setSaving(true);
    const body: Record<string, string> = { name: edit.name, province: edit.province, city: edit.city };
    if (edit.nationalCode.trim()) body.nationalCode = edit.nationalCode;
    const r = await apiFetch("/api/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json(); setSaving(false);
    if (r.ok) { setUser(d.user); setEdit(e => ({ ...e, nationalCode: "" })); notify("✅ پروفایل ذخیره شد"); }
    else notify(d.error || "خطا در ذخیره");
  };

  const patchListing = async (id: number, patch: Partial<ListingT>) => {
    await fetch(`/api/listings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    setMyListings(ls => ls.map(x => x.id === id ? { ...x, ...patch } : x));
  };
  const deleteListing = async (id: number) => {
    if (!confirm("این آگهی شما حذف شود؟")) return;
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    setMyListings(ls => ls.filter(x => x.id !== id)); notify("آگهی حذف شد");
  };

  if (loading || !user) return <div className="text-center py-24"><Loader2 className="animate-spin mx-auto text-[#c9a227]" size={38} /><p className="font-bold text-gray-500 mt-3">در حال باز کردن پنل شخصی شما...</p></div>;

  const totalViews = myListings.reduce((a, x) => a + (x.views || 0), 0);
  const inputCls = "w-full bg-[#faf6ec] ring-1 ring-[#e8dcbb] rounded-2xl px-4 py-3 text-sm font-bold";
  const labelCls = "block text-[13px] font-black text-[#0b3d2e] mb-1.5";

  return (
    <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
      {/* سربرگ پروفایل */}
      <div className="relative overflow-hidden bg-[#062e22] rounded-[32px] p-6 md:p-8 text-white">
        <div className="absolute -top-16 -left-16 w-56 h-56 bg-[#c9a227]/20 blur-3xl rounded-full" />
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f3d67a] to-[#a8821c] ring-4 ring-white/15 flex items-center justify-center text-3xl font-black text-[#062e22]">{user.name.slice(0, 1)}</span>
          <div className="min-w-[200px]">
            <h1 className="text-2xl font-black flex items-center gap-2">{user.name} {user.identityVerified && <BadgeCheck className="text-[#e8c766]" size={22} />}</h1>
            <p className="text-emerald-100/75 text-sm mt-1 font-semibold" dir="ltr" style={{ textAlign: "right" }}>{user.phone} • {user.city || "شهر ثبت نشده"}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`flex items-center gap-1 text-[11px] font-black px-3 py-1.5 rounded-full ${user.phoneVerified ? "bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-300/40" : "bg-white/10 text-white/60"}`}><Smartphone size={13} /> {user.phoneVerified ? "موبایل تایید شده ✓" : "موبایل تایید نشده"}</span>
              <span className={`flex items-center gap-1 text-[11px] font-black px-3 py-1.5 rounded-full ${user.identityVerified ? "bg-[#c9a227] text-[#062e22]" : "bg-amber-400/20 text-amber-200 ring-1 ring-amber-300/40"}`}><ShieldCheck size={13} /> {user.identityVerified ? "احراز هویت‌شده ✓" : "احراز هویت ناتمام"}</span>
            </div>
          </div>
          <div className="mr-auto flex gap-2">
            <Link href="/post" className="flex items-center gap-1.5 bg-gradient-to-l from-[#c9a227] to-[#e8c766] text-[#062e22] px-5 py-3 rounded-full font-black text-sm shadow-lg hover:scale-105 transition"><PlusCircle size={17} /> ثبت آگهی جدید</Link>
            <button onClick={logout} className="flex items-center gap-1.5 bg-white/10 ring-1 ring-white/20 px-4 py-3 rounded-full font-black text-sm hover:bg-red-500/80 transition"><LogOut size={16} /> خروج</button>
          </div>
        </div>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mt-5">
        {[
          { n: myListings.length, l: "آگهی‌های من", i: ListChecks, href: "#my-ads" },
          { n: totalViews, l: "بازدید آگهی‌هایم", i: Eye, href: "#my-ads" },
          { n: favCount, l: "نشان‌شده‌ها", i: Heart, href: "/favorites" },
        ].map((x, i) => (
          <Link key={i} href={x.href} className="bg-white rounded-[24px] ring-1 ring-[#e8dcbb] p-5 lux-shadow card-hover text-center">
            <x.i className="mx-auto text-[#c9a227]" size={24} />
            <p className="text-2xl md:text-3xl font-black text-[#0b3d2e] mt-2">{x.n.toLocaleString("fa-IR")}</p>
            <p className="text-xs text-gray-500 font-bold mt-1">{x.l}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-5 mt-5 items-start">
        {/* ویرایش پروفایل و احراز هویت */}
        <div className="bg-white rounded-[28px] ring-1 ring-[#e8dcbb] p-6 lux-shadow">
          <h2 className="font-black text-[#0b3d2e] flex items-center gap-2"><Pencil size={18} className="text-[#c9a227]" /> اطلاعات و احراز هویت</h2>
          <div className="space-y-4 mt-5">
            <div><label className={labelCls}>نام و نام خانوادگی</label><input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>استان</label>
                <select value={edit.province} onChange={e => { const p = e.target.value; setEdit(ed => ({ ...ed, province: p, city: citiesOf(p)[0] || ed.city })); }} className={inputCls}>{PROVINCES.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select>
              </div>
              <div><label className={labelCls}>شهر</label>
                <select value={edit.city} onChange={e => setEdit({ ...edit, city: e.target.value })} className={inputCls}>{citiesOf(edit.province).map(c => <option key={c} value={c}>{c}</option>)}</select>
              </div>
            </div>
            <div>
              <label className={labelCls}>کد ملی {user.hasNationalCode && <span className="text-emerald-600">— ثبت‌شده ({user.nationalCodeMasked})</span>}</label>
              <input value={edit.nationalCode} onChange={e => setEdit({ ...edit, nationalCode: e.target.value })} placeholder={user.hasNationalCode ? "برای تغییر، کد ملی جدید را بنویسید" : "کد ملی ۱۰ رقمی"} inputMode="numeric" dir="ltr" style={{ textAlign: "left" }} className={`${inputCls} tracking-widest`} maxLength={10} />
              {!user.identityVerified && <p className="text-[11px] text-amber-600 font-bold mt-1.5 leading-5">⚠️ با ثبت کد ملی معتبر، نشان طلایی «احراز هویت‌شده» می‌گیرید و خریدارها بیشتر به شما اعتماد می‌کنند.</p>}
            </div>
            <div className="bg-[#faf6ec] ring-1 ring-[#efe3c2] rounded-2xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-black text-[#0b3d2e]">شماره موبایل</span>
              <span className="text-sm font-bold text-gray-500 flex items-center gap-1.5" dir="ltr">{user.phone} <Smartphone size={15} className="text-emerald-600" /></span>
            </div>
            <button onClick={saveProfile} disabled={saving} className="btn-gold">
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} ذخیره تغییرات
            </button>
            <Link href="/admin" className="flex items-center justify-center gap-2 w-full bg-[#faf6ec] ring-1 ring-dashed ring-[#c9a227] text-[#8a6d1b] py-3 rounded-full font-black text-sm"><LayoutDashboard size={16} /> مدیر سایت هستید؟ پنل مدیریت طوقی</Link>
          </div>
        </div>

        {/* آگهی‌های من */}
        <div id="my-ads" className="bg-white rounded-[28px] ring-1 ring-[#e8dcbb] p-6 lux-shadow">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-[#0b3d2e] flex items-center gap-2"><Bird size={19} className="text-[#c9a227]" /> آگهی‌های من ({myListings.length.toLocaleString("fa-IR")})</h2>
            <Link href="/post" className="text-xs font-black text-[#b48a12]">+ آگهی جدید</Link>
          </div>
          {myListings.length === 0 ? (
            <div className="text-center py-12">
              <Bird className="mx-auto text-[#e8dcbb]" size={46} />
              <p className="font-black text-[#0b3d2e] mt-3">هنوز آگهی‌ای ثبت نکرده‌اید</p>
              <p className="text-sm text-gray-400 mt-1">اولین پرنده‌تان را همین حالا آگهی کنید.</p>
              <Link href="/post" className="inline-block mt-4 bg-[#0b3d2e] text-[#e8c766] px-6 py-3 rounded-full font-black text-sm">ثبت اولین آگهی</Link>
            </div>
          ) : (
            <div className="space-y-3 mt-5">
              {myListings.map(l => (
                <div key={l.id} className="flex flex-wrap items-center gap-3 bg-[#fffdf6] ring-1 ring-[#e8dcbb] rounded-3xl p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.image} alt="" className="w-[74px] h-14 object-cover rounded-2xl shrink-0" />
                  <div className="flex-1 min-w-[170px]">
                    <Link href={`/listings/${l.id}`} className="font-black text-sm text-[#0b3d2e] line-clamp-1 hover:text-[#b48a12]">{l.title}</Link>
                    <p className="text-[11px] text-gray-400 font-semibold mt-1">{formatPrice(l.price)} • {(l.views || 0).toLocaleString("fa-IR")} بازدید</p>
                  </div>
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${l.status === "active" ? "bg-emerald-100 text-emerald-700" : l.status === "sold" ? "bg-gray-200 text-gray-500" : "bg-amber-100 text-amber-700"}`}>{l.status === "active" ? "فعال" : l.status === "sold" ? "فروخته شد" : "مخفی"}</span>
                  {l.status !== "sold"
                    ? <button onClick={() => patchListing(l.id, { status: "sold" })} className="flex items-center gap-1 bg-emerald-700 text-white text-xs font-black px-3 py-2 rounded-full"><Check size={14} /> فروخته شد</button>
                    : <button onClick={() => patchListing(l.id, { status: "active" })} className="flex items-center gap-1 bg-[#0b3d2e] text-[#e8c766] text-xs font-black px-3 py-2 rounded-full">فعال‌سازی دوباره</button>}
                  <button onClick={() => patchListing(l.id, { status: l.status === "hidden" ? "active" : "hidden" })} title="مخفی/نمایش" className="w-9 h-9 rounded-full bg-white ring-1 ring-[#e8dcbb] flex items-center justify-center text-gray-500">{l.status === "hidden" ? <EyeIcon size={16} /> : <EyeOff size={16} />}</button>
                  <button onClick={() => deleteListing(l.id)} className="w-9 h-9 rounded-full bg-red-50 text-red-500 ring-1 ring-red-200 flex items-center justify-center"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && <div className="fixed bottom-28 right-1/2 translate-x-1/2 z-[80] bg-[#062e22] text-white text-sm font-bold px-6 py-3.5 rounded-full shadow-2xl ring-1 ring-[#c9a227]/50 animate-fadeUp whitespace-nowrap">{toast}</div>}
    </div>
  );
}
