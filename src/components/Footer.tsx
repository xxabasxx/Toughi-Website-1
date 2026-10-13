import Link from "next/link";
import { Bird, Phone, Mail, MapPin, Heart, ShieldCheck, Truck, Headset } from "lucide-react";

export default function Footer({ settings }: { settings: Record<string,string> }) {
  return (
    <footer className="bg-[#062e22] text-emerald-50 mt-20 relative overflow-hidden">
      <div className="h-1 shimmer-line" />
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#c9a227]/15 blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-4 gap-10 relative">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-12 rounded-2xl bg-white/10 ring-1 ring-[#c9a227]/60 flex items-center justify-center"><Bird className="text-[#e8c766]"/></span>
            <span className="text-3xl font-black gold-text">{settings.siteName}</span>
          </div>
          <p className="text-sm leading-7 text-emerald-100/80">{settings.footerText}</p>
          <div className="flex gap-2 mt-5">
            {["اینستاگرام","تلگرام","واتساپ","آپارات"].map(s=>(
              <span key={s} className="px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/15 text-xs font-bold hover:bg-[#c9a227] hover:text-[#062e22] transition cursor-pointer">{s}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-black text-[#e8c766] mb-4">دسترسی سریع</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="hover:text-[#e8c766]" href="/listings">همه آگهی‌ها</Link></li>
            <li><Link className="hover:text-[#e8c766]" href="/post">ثبت آگهی رایگان</Link></li>
            <li><Link className="hover:text-[#e8c766]" href="/account">پنل شخصی من</Link></li>
            <li><Link className="hover:text-[#e8c766]" href="/login">ورود | ثبت‌نام با موبایل</Link></li>
            <li><Link className="hover:text-[#e8c766]" href="/favorites">آگهی‌های نشان‌شده</Link></li>
            <li><Link className="hover:text-[#e8c766]" href="/admin">پنل مدیریت و ویرایش زنده</Link></li>
            <li><Link className="hover:text-[#e8c766]" href="/#guide">راهنمای خرید امن</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-[#e8c766] mb-4">دسته‌های محبوب</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="hover:text-[#e8c766]" href="/listings?cat=kabootar">کبوتر تزئینی پا‌پر</Link></li>
            <li><Link className="hover:text-[#e8c766]" href="/listings?cat=toti">طوطی سخنگو</Link></li>
            <li><Link className="hover:text-[#e8c766]" href="/listings?cat=ghanari">قناری و سهره</Link></li>
            <li><Link className="hover:text-[#e8c766]" href="/listings?cat=pets">حیوانات خانگی</Link></li>
            <li><Link className="hover:text-[#e8c766]" href="/listings?cat=lavazem">قفس و لوازم لوکس</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-[#e8c766] mb-4">تماس با طوقی</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><Phone size={17} className="text-[#c9a227]"/> {settings.contactPhone}</li>
            <li className="flex gap-2"><Mail size={17} className="text-[#c9a227]"/> {settings.contactEmail}</li>
            <li className="flex gap-2"><MapPin size={17} className="text-[#c9a227]"/> {settings.contactAddress}</li>
          </ul>
          <div className="grid grid-cols-3 gap-2 mt-5 text-center">
            {[{i:ShieldCheck,t:"خرید امن"},{i:Truck,t:"ارسال سراسری"},{i:Headset,t:"پشتیبانی ۲۴/۷"}].map((x,i)=>(
              <div key={i} className="bg-white/5 ring-1 ring-white/10 rounded-2xl py-3"><x.i className="mx-auto text-[#e8c766]" size={20}/><p className="text-[11px] mt-1 font-bold">{x.t}</p></div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-emerald-100/60 relative">
        © {new Date().toLocaleDateString("fa-IR",{year:"numeric"})} {settings.siteName} — تمامی حقوق محفوظ است. ساخته‌شده با <Heart size={12} className="inline text-[#c9a227]"/> برای عشق‌بازان ایران | رمز پنل مدیریت: toghi123 (از داخل پنل قابل تغییر است)
      </div>
    </footer>
  );
}
