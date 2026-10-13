import Link from "next/link";
import { db } from "@/db";
import { listings, categories } from "@/db/schema";
import { getSettings, ensureSeed } from "@/lib/seed";
import { eq, desc, asc } from "drizzle-orm";
import ListingCard from "@/components/ListingCard";
import { Search, MapPin, Crown, Sparkles, ShieldCheck, Truck, BadgeCheck, Headset, ArrowLeft, Bird, Trophy, Heart } from "lucide-react";
import type { ListingT, CategoryT } from "@/lib/client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureSeed();
  const s = await getSettings();
  const catsRaw = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  const featured = await db.select().from(listings).where(eq(listings.featured, true)).orderBy(desc(listings.createdAt)).limit(8);
  const latest = await db.select().from(listings).where(eq(listings.status, "active")).orderBy(desc(listings.createdAt)).limit(12);
  const cats = catsRaw as unknown as CategoryT[];
  const toT = (r: typeof listings.$inferSelect): ListingT => ({ ...r, createdAt: r.createdAt.toISOString(), images: (r.images as string[])||[] });

  const features = [
    { icon: ShieldCheck, t: s.feature1Title, d: s.feature1Text },
    { icon: BadgeCheck, t: s.feature2Title, d: s.feature2Text },
    { icon: Heart, t: s.feature3Title, d: s.feature3Text },
    { icon: Headset, t: s.feature4Title, d: s.feature4Text },
  ];

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-[#062e22]">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.heroImage} alt="کبوتر تزئینی پا‌پر و گردن‌فر طوقی" className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#062e22] via-[#062e22]/78 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#062e22] via-transparent to-[#062e22]/30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-10 items-center">
          <div className="text-white animate-fadeUp">
            <span className="inline-flex items-center gap-2 bg-white/10 ring-1 ring-[#c9a227]/60 backdrop-blur px-4 py-2 rounded-full text-[13px] font-bold text-[#f3d67a]"><Sparkles size={15}/>{s.heroBadge}</span>
            <h1 className="mt-6 text-4xl md:text-6xl font-black leading-[1.2]">
              {s.heroTitle}<br/><span className="gold-text">{s.heroTitleGold}</span>
            </h1>
            <p className="mt-5 text-emerald-50/85 leading-8 text-[15px] md:text-base max-w-xl">{s.heroSubtitle}</p>

            <form action="/listings" className="mt-8 bg-white rounded-full p-1.5 flex items-center shadow-2xl max-w-xl">
              <Search className="mr-3 text-[#0b3d2e]/60 shrink-0" size={20}/>
              <input name="q" placeholder="جستجو: یعقوبی پا‌پر، کاسکو، قناری..." className="flex-1 min-w-0 text-sm text-gray-800 placeholder:text-gray-400 py-2.5" style={{boxShadow:"none",border:"none"}} />
              <select name="city" className="hidden sm:block text-sm text-gray-600 bg-transparent border-r px-2" style={{boxShadow:"none",borderTop:"none",borderBottom:"none",borderLeft:"none"}}>
                <option>همه شهرها</option><option>تهران</option><option>مشهد</option><option>اصفهان</option><option>شیراز</option><option>تبریز</option>
              </select>
              <button className="bg-gradient-to-l from-[#c9a227] to-[#e8c766] text-[#062e22] font-black px-6 py-3 rounded-full text-sm hover:scale-[1.03] transition shrink-0">جستجو</button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="text-emerald-100/70 font-bold py-1.5">جستجوهای داغ:</span>
              {["کبوتر یعقوبی","کاسکو سخنگو","قناری رسمی‌بلند","مرغ عشق","لاهور پا‌پر"].map(t=>(
                <Link key={t} href={`/listings?q=${encodeURIComponent(t)}`} className="bg-white/10 hover:bg-[#c9a227] hover:text-[#062e22] ring-1 ring-white/20 px-3 py-1.5 rounded-full font-bold transition">{t}</Link>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-3 max-w-md divide-x divide-x-reverse divide-white/15 bg-white/5 ring-1 ring-white/10 backdrop-blur rounded-3xl py-4">
              {[{n:s.heroStat1Num,l:s.heroStat1Label},{n:s.heroStat2Num,l:s.heroStat2Label},{n:s.heroStat3Num,l:s.heroStat3Label}].map((x,i)=>(
                <div key={i} className="text-center px-2"><p className="text-xl md:text-2xl font-black gold-text">{x.n}</p><p className="text-[11px] md:text-xs text-emerald-100/75 mt-1 font-semibold">{x.l}</p></div>
              ))}
            </div>
          </div>

          <div className="hidden md:block relative animate-fadeUp delay-2">
            <div className="absolute -inset-6 bg-[#c9a227]/20 blur-3xl rounded-full" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/pigeon-pair.jpg" alt="جفت کبوتر زینتی لاهور پا‌پر" className="relative rounded-[36px] ring-2 ring-[#c9a227]/60 object-cover h-[430px] w-full shadow-2xl animate-floaty" />
            <div className="absolute -bottom-5 right-6 bg-white rounded-3xl shadow-2xl px-5 py-4 flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-[#062e22] flex items-center justify-center"><Trophy className="text-[#e8c766]" size={21}/></span>
              <span><b className="block text-sm text-[#0b3d2e]">پرنده‌ی هفته‌ی طوقی</b><span className="text-xs text-gray-500">یعقوبی سفید اصل • تهران</span></span>
              <Link href="/listings?cat=kabootar" className="mr-2 bg-[#c9a227] text-[#062e22] text-xs font-black px-3 py-2 rounded-full">مشاهده</Link>
            </div>
          </div>
        </div>
        <div className="h-1.5 shimmer-line relative" />
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="max-w-7xl mx-auto px-4 -mt-2 pt-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[#b48a12] font-black text-sm flex items-center gap-1.5"><Sparkles size={16}/> دسته‌بندی‌های طلایی</p>
            <h2 className="text-2xl md:text-3xl font-black text-[#0b3d2e] mt-1">دنبال چه پرنده‌ای هستی؟</h2>
          </div>
          <Link href="/listings" className="hidden sm:flex items-center gap-1 text-sm font-black text-[#0b3d2e] hover:text-[#b48a12]">همه آگهی‌ها <ArrowLeft size={16}/></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cats.map((c,i)=>(
            <Link key={c.id} href={`/listings?cat=${c.slug}`} className={`card-hover group relative rounded-[26px] overflow-hidden ring-1 ring-[#e8dcbb] ${i===0?"col-span-2 row-span-2 h-full min-h-[280px]":"h-[170px] md:h-[190px]"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image || "/images/hero-pigeon.jpg"} alt={c.name} className="card-img absolute inset-0 w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#062e22]/92 via-[#062e22]/25 to-transparent" />
              <div className="absolute bottom-0 p-4 text-white">
                <span className="text-2xl">{c.icon}</span>
                <h3 className="font-black mt-1">{c.name}</h3>
                <p className="text-[11px] text-emerald-100/80 leading-5 line-clamp-2 hidden md:block">{c.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== FEATURED ===== */}
      <section className="max-w-7xl mx-auto px-4 pt-16">
        <div className="relative bg-gradient-to-l from-[#062e22] to-[#0f5132] rounded-[36px] px-5 py-8 md:p-10 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#c9a227]/20 blur-3xl rounded-full"/>
          <div className="flex items-end justify-between mb-7 relative">
            <div>
              <p className="text-[#e8c766] font-black text-sm flex items-center gap-1.5"><Crown size={17}/> گالری ستاره‌ها</p>
              <h2 className="text-2xl md:text-3xl font-black text-white mt-1">آگهی‌های ویژه‌ی طلایی طوقی</h2>
            </div>
            <Link href="/listings?featured=1" className="hidden sm:flex items-center gap-1 bg-[#c9a227] text-[#062e22] text-sm font-black px-4 py-2.5 rounded-full hover:scale-105 transition">همه ویژه‌ها <ArrowLeft size={15}/></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {featured.slice(0,4).map(r=><ListingCard key={r.id} item={toT(r)} />)}
          </div>
        </div>
        {featured.length>4 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {featured.slice(4,8).map(r=><ListingCard key={r.id} item={toT(r)} />)}
          </div>
        )}
      </section>

      {/* ===== LATEST ===== */}
      <section className="max-w-7xl mx-auto px-4 pt-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[#b48a12] font-black text-sm flex items-center gap-1.5"><Bird size={16}/> تازه رسیده‌ها</p>
            <h2 className="text-2xl md:text-3xl font-black text-[#0b3d2e] mt-1">جدیدترین آگهی‌ها</h2>
          </div>
          <Link href="/listings" className="flex items-center gap-1 text-sm font-black text-[#0b3d2e] hover:text-[#b48a12]">مشاهده همه <ArrowLeft size={16}/></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {latest.map(r=><ListingCard key={r.id} item={toT(r)} />)}
        </div>
        {latest.length===0 && <div className="text-center py-16 bg-white rounded-3xl ring-1 ring-[#e8dcbb]"><Bird className="mx-auto text-[#c9a227]" size={44}/><p className="mt-3 font-bold text-gray-500">هنوز آگهی‌ای ثبت نشده — اولین نفر باش!</p><Link href="/post" className="inline-block mt-4 bg-[#0b3d2e] text-[#e8c766] px-6 py-3 rounded-full font-black text-sm">ثبت آگهی رایگان</Link></div>}
      </section>

      {/* ===== FEATURES ===== */}
      <section className="max-w-7xl mx-auto px-4 pt-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f,i)=>(
            <div key={i} className="bg-white rounded-[26px] p-6 ring-1 ring-[#e8dcbb] lux-shadow card-hover">
              <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0b3d2e] to-[#14532d] ring-2 ring-[#c9a227]/50 flex items-center justify-center"><f.icon className="text-[#e8c766]" size={26}/></span>
              <h3 className="font-black text-[#0b3d2e] mt-4">{f.t}</h3>
              <p className="text-sm text-gray-500 leading-7 mt-1.5">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="max-w-7xl mx-auto px-4 pt-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-[#c9a227]/15 blur-2xl rounded-full"/>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.aboutImage} alt="درباره طوقی" className="relative rounded-[36px] object-cover h-[420px] w-full ring-2 ring-[#c9a227]/50 shadow-2xl"/>
            <div className="absolute bottom-6 right-6 left-6 sm:left-auto bg-white/92 backdrop-blur rounded-3xl p-4 flex items-center gap-3 shadow-xl">
              <Truck className="text-[#c9a227]" size={30}/>
              <span className="text-sm font-bold text-[#0b3d2e]">ارسال امن و تخصصی پرندگان<br/><span className="text-gray-500 font-semibold text-xs">به تمام شهرهای ایران با باکس استاندارد</span></span>
            </div>
          </div>
          <div>
            <p className="text-[#b48a12] font-black text-sm">✦ قصه‌ی ما</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#0b3d2e] leading-snug mt-2">{s.aboutTitle}</h2>
            <p className="text-gray-600 leading-9 mt-4 text-[15px]">{s.aboutText}</p>
            <div className="grid grid-cols-3 gap-3 mt-7 text-center">
              {[{n:"۱۴+",l:"سال تجربه"},{n:"۳۱",l:"استان تحت پوشش"},{n:"۲۴/۷",l:"پشتیبانی واقعی"}].map((x,i)=>(
                <div key={i} className="bg-white rounded-3xl ring-1 ring-[#e8dcbb] py-4 lux-shadow"><p className="text-2xl font-black gold-text">{x.n}</p><p className="text-xs text-gray-500 font-bold mt-1">{x.l}</p></div>
              ))}
            </div>
            <div className="flex gap-3 mt-7">
              <Link href="/listings" className="bg-[#0b3d2e] text-white px-6 py-3.5 rounded-full font-black text-sm shadow-lg hover:scale-[1.03] transition">شروع خرید</Link>
              <Link href="/post" className="bg-gradient-to-l from-[#c9a227] to-[#e8c766] text-[#062e22] px-6 py-3.5 rounded-full font-black text-sm shadow-lg hover:scale-[1.03] transition">فروش پرنده‌ی من</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GUIDE ===== */}
      <section id="guide" className="max-w-7xl mx-auto px-4 pt-20">
        <div className="bg-white rounded-[36px] ring-1 ring-[#e8dcbb] lux-shadow p-7 md:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <p className="text-[#b48a12] font-black text-sm flex items-center gap-1.5"><ShieldCheck size={16}/> امنیت معامله</p>
            <h3 className="text-2xl font-black text-[#0b3d2e] mt-1">{s.guideTitle}</h3>
            <p className="text-gray-600 leading-8 mt-3 text-sm whitespace-pre-line">{s.guideText}</p>
          </div>
          <span className="hidden md:flex w-28 h-28 rounded-full bg-[#062e22] ring-4 ring-[#c9a227]/40 items-center justify-center"><ShieldCheck className="text-[#e8c766]" size={46}/></span>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="max-w-7xl mx-auto px-4 pt-16">
        <div className="relative overflow-hidden bg-[#062e22] rounded-[36px] px-6 py-12 md:p-14 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero-pigeon.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25"/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#062e22] via-[#062e22]/70 to-transparent"/>
          <div className="relative">
            <Bird className="mx-auto text-[#e8c766] animate-floaty" size={44}/>
            <h2 className="text-2xl md:text-4xl font-black text-white mt-4 leading-snug">{s.ctaTitle}</h2>
            <p className="text-emerald-100/85 mt-3 max-w-xl mx-auto leading-8 text-sm md:text-base">{s.ctaText}</p>
            <Link href="/post" className="inline-flex items-center gap-2 mt-7 bg-gradient-to-l from-[#c9a227] to-[#f3d67a] text-[#062e22] font-black px-8 py-4 rounded-full shadow-2xl hover:scale-105 transition">+ ثبت آگهی رایگان من</Link>
            <p className="text-[11px] text-emerald-100/60 mt-4 flex items-center justify-center gap-1"><MapPin size={12}/> در کمتر از ۲ دقیقه • بدون نیاز به ثبت‌نام • انتشار فوری</p>
          </div>
        </div>
      </section>
    </div>
  );
}
