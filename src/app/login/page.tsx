"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Bird, Smartphone, KeyRound, UserRound, ShieldCheck, Loader2, ArrowRight, BadgeCheck, MapPin } from "lucide-react";
import { PROVINCES, citiesOf } from "@/lib/provinces";
import { setToken, setPendingToken, getPendingToken, clearPendingToken } from "@/lib/api";

const toEn = (s: string) => (s || "").replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/account";
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [name, setName] = useState("");
  const [nationalCode, setNationalCode] = useState("");
  const [province, setProvince] = useState("تهران");
  const [city, setCity] = useState("تهران");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [timer, setTimer] = useState(0);

  const startTimer = () => {
    setTimer(60);
    const iv = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(iv); return 0; } return t - 1; }), 1000);
  };
  const changeProvince = (p: string) => { setProvince(p); setCity(citiesOf(p)[0] || ""); };

  const requestOtp = async () => {
    setErr("");
    const p = toEn(phone).trim();
    if (!/^09\d{9}$/.test(p)) return setErr("شماره موبایل ۱۱ رقمی صحیح را وارد کنید — مثال: 09123456789");
    setBusy(true);
    try {
      const r = await fetch("/api/auth/request-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: p }) });
      const d = await r.json(); setBusy(false);
      if (!r.ok) return setErr(d.error || "خطا در ارسال کد");
      setPhone(p); setDevCode(d.devCode || ""); setStep(2); startTimer();
    } catch { setBusy(false); setErr("خطای ارتباط با سرور؛ دوباره تلاش کنید"); }
  };

  const verify = async () => {
    setErr("");
    if (toEn(code).trim().length < 5) return setErr("کد ۵ رقمی پیامک‌شده را کامل وارد کنید");
    setBusy(true);
    try {
      const r = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, code }) });
      const d = await r.json(); setBusy(false);
      if (!r.ok) return setErr(d.error || "کد اشتباه است");
      if (d.needProfile) {
        if (d.pendingToken) setPendingToken(d.pendingToken);
        setStep(3); return;
      }
      if (d.token) setToken(d.token);
      clearPendingToken();
      router.push(next); router.refresh();
    } catch { setBusy(false); setErr("خطای ارتباط با سرور؛ دوباره تلاش کنید"); }
  };

  const register = async () => {
    setErr("");
    if (name.trim().length < 3) return setErr("نام و نام خانوادگی کامل را بنویسید");
    if (toEn(nationalCode).replace(/\D/g, "").length !== 10) return setErr("کد ملی باید ۱۰ رقم باشد");
    setBusy(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getPendingToken() ? { Authorization: `Bearer ${getPendingToken()}` } : {}) },
        body: JSON.stringify({ name, nationalCode, province, city, pendingToken: getPendingToken() }),
      });
      const d = await r.json(); setBusy(false);
      if (!r.ok) {
        if (d.expired) { clearPendingToken(); setStep(1); setCode(""); return setErr("نشست تایید موبایل تمام شده بود؛ شماره را دوباره وارد کنید و کد جدید بگیرید (این بار سریع‌تر تکمیل کنید)."); }
        return setErr(d.error || "خطا در ثبت‌نام");
      }
      if (d.token) setToken(d.token);
      clearPendingToken();
      router.push(next); router.refresh();
    } catch { setBusy(false); setErr("خطای ارتباط با سرور؛ دوباره تلاش کنید"); }
  };

  const inputCls = "w-full bg-[#faf6ec] ring-1 ring-[#e8dcbb] rounded-2xl px-4 py-3.5 text-sm font-bold";
  const steps = ["شماره موبایل", "کد تایید", "احراز هویت"];
  // دکمه طلایی لاکچری (مثل نسخه اول) با حس فشرده‌شدن نرم
  const goldBtn = "btn-gold";

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white rounded-[32px] ring-1 ring-[#e8dcbb] lux-shadow p-7 md:p-8 animate-fadeUp relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1.5 shimmer-line" />
        <span className="w-[72px] h-[72px] bg-[#062e22] ring-4 ring-[#c9a227]/40 rounded-full flex items-center justify-center mx-auto"><Bird className="text-[#e8c766]" size={32} /></span>
        <h1 className="text-2xl font-black text-[#0b3d2e] text-center mt-4">ورود به طوقی</h1>
        <p className="text-sm text-gray-500 text-center mt-1.5 leading-6">با شماره موبایل وارد شوید؛ اگر حساب ندارید، در چند ثانیه با احراز هویت ساخته می‌شود.</p>

        <div className="flex items-center justify-center gap-1.5 mt-6">
          {steps.map((s, i) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={`flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full ${step === i + 1 ? "bg-[#0b3d2e] text-[#e8c766]" : step > i + 1 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                {step > i + 1 ? <BadgeCheck size={13} /> : <span>{(i + 1).toLocaleString("fa-IR")}</span>} {s}
              </span>
              {i < 2 && <span className="w-4 h-px bg-[#e8dcbb]" />}
            </span>
          ))}
        </div>

        {step === 1 && (
          <div className="mt-7 space-y-5 animate-fadeUp">
            <div>
              <label className="block text-sm font-black text-[#0b3d2e] mb-2">شماره موبایل</label>
              <div className="relative">
                <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9a227]" size={20} />
                <input value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === "Enter" && requestOtp()} placeholder="09123456789" inputMode="tel" dir="ltr" style={{ textAlign: "left" }} className={`${inputCls} pr-12 text-base tracking-widest`} />
              </div>
            </div>
            <button onClick={requestOtp} disabled={busy} className={goldBtn}>
              {busy ? <Loader2 className="animate-spin text-[#062e22]" size={22} /> : <KeyRound size={22} className="text-[#062e22]" />}
              <span>تایید شماره و دریافت کد پیامکی</span>
            </button>
            <p className="text-[11px] text-gray-400 leading-5 text-center font-semibold">با ادامه، <Link href="/#guide" className="text-[#b48a12] font-black">قوانین طوقی</Link> را می‌پذیرید. کد تایید به همین شماره پیامک می‌شود.</p>
          </div>
        )}

        {step === 2 && (
          <div className="mt-7 space-y-4 animate-fadeUp">
            <p className="text-sm text-gray-600 text-center font-semibold">کد ۵ رقمی ارسال‌شده به <b dir="ltr" className="text-[#0b3d2e]">{phone}</b> را وارد کنید</p>
            {devCode && (
              <div className="bg-amber-50 ring-1 ring-amber-300 rounded-2xl px-4 py-3 text-center">
                <p className="text-[11px] font-black text-amber-700">حالت نمایشی (درگاه پیامک هنوز به سرور وصل نشده)</p>
                <p className="text-2xl font-black tracking-[.4em] text-amber-800 mt-1" dir="ltr">{devCode}</p>
                <p className="text-[11px] text-amber-600 mt-1">با اتصال KAVENEGAR_API_KEY این کد واقعاً پیامک می‌شود.</p>
              </div>
            )}
            <input value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === "Enter" && verify()} placeholder="• • • • •" inputMode="numeric" dir="ltr" style={{ textAlign: "center" }} className={`${inputCls} text-center text-2xl tracking-[.5em] font-black`} maxLength={5} />
            <button onClick={verify} disabled={busy} className={goldBtn}>
              {busy ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />} تایید کد و ادامه
            </button>
            <div className="flex justify-between text-xs font-bold">
              <button onClick={() => setStep(1)} className="text-gray-500 flex items-center gap-1"><ArrowRight size={14} /> اصلاح شماره</button>
              {timer > 0 ? <span className="text-gray-400">ارسال مجدد کد تا {timer.toLocaleString("fa-IR")} ثانیه دیگر</span>
                : <button onClick={requestOtp} className="text-[#b48a12] font-black">ارسال مجدد کد</button>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-7 space-y-4 animate-fadeUp">
            <div className="bg-emerald-50 ring-1 ring-emerald-200 rounded-2xl px-4 py-3 flex gap-2.5">
              <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={20} />
              <p className="text-xs text-emerald-800 leading-6 font-semibold"><b>احراز هویت واقعی:</b> شماره شما با پیامک تایید شد. نام، کد ملی و محل سکونت را وارد کنید تا هویت‌تان بررسی و نشان «احراز هویت‌شده» بگیرید.</p>
            </div>
            <div>
              <label className="block text-sm font-black text-[#0b3d2e] mb-2">نام و نام خانوادگی</label>
              <div className="relative">
                <UserRound className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9a227]" size={19} />
                <input value={name} onChange={e => setName(e.target.value)} placeholder="مثال: علی محمدی" className={`${inputCls} pr-11`} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-black text-[#0b3d2e] mb-2">کد ملی (۱۰ رقم)</label>
              <input value={nationalCode} onChange={e => setNationalCode(e.target.value)} onKeyDown={e => e.key === "Enter" && register()} placeholder="0012345678" inputMode="numeric" dir="ltr" style={{ textAlign: "left" }} className={`${inputCls} tracking-widest`} maxLength={10} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-black text-[#0b3d2e] mb-2"><MapPin size={14} className="inline text-[#c9a227]" /> استان</label>
                <select value={province} onChange={e => changeProvince(e.target.value)} className={inputCls}>
                  {PROVINCES.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-[#0b3d2e] mb-2">شهر</label>
                <select value={city} onChange={e => setCity(e.target.value)} className={inputCls}>
                  {citiesOf(province).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button onClick={register} disabled={busy} className={goldBtn}>
              {busy ? <Loader2 className="animate-spin" size={20} /> : <BadgeCheck size={20} />} تکمیل ثبت‌نام و احراز هویت
            </button>
            <p className="text-[11px] text-center text-gray-400 font-semibold">کد ملی فقط برای احراز هویت است و به هیچ‌کس نمایش داده نمی‌شود.</p>
          </div>
        )}

        {err && <p className="bg-red-50 text-red-600 ring-1 ring-red-200 rounded-2xl px-4 py-3 text-sm font-bold mt-5 text-center leading-6">{err}</p>}
      </div>
      <p className="text-center text-xs text-gray-400 font-semibold mt-5">مدیر سایت؟ <Link href="/admin" className="text-[#b48a12] font-black">ورود به پنل مدیریت طوقی</Link></p>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="text-center py-20 font-bold text-gray-500">در حال بارگذاری...</div>}><LoginInner /></Suspense>;
}
