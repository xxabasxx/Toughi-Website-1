import { db } from "@/db";
import { categories, listings, siteSettings } from "@/db/schema";
import { sql } from "drizzle-orm";

export const CITIES = ["همه شهرها","تهران","مشهد","اصفهان","شیراز","تبریز","کرج","قم","اهواز","کرمانشاه","یزد","رشت","کرمان","ارومیه","همدان","زنجان","قزوین","ساری","گرگان","بندرعباس"];

export const DEFAULT_SETTINGS: Record<string,string> = {
  siteName: "طوقی",
  tagline: "بازار لوکس کبوتر، پرندگان و حیوانات خانگی ایران",
  heroBadge: "✦ اولین بازار تخصصی و لوکس پرندگان ایران",
  heroTitle: "جایی که پرندگان و حیوانات",
  heroTitleGold: "خاص و اصیل",
  heroSubtitle: "خرید و فروش امن کبوترهای تزئینی پا‌پر و گردن‌فر، طوطی‌های سخنگو، قناری‌های آوازخوان و حیوانات خانگی اصیل — مستقیم از پرورش‌دهندگان معتبر سراسر ایران.",
  heroImage: "/images/hero-pigeon.jpg",
  heroStat1Num: "+۱۲٬۴۰۰", heroStat1Label: "آگهی فعال",
  heroStat2Num: "+۸٬۹۰۰", heroStat2Label: "پرورش‌دهنده معتبر",
  heroStat3Num: "۹۸٪", heroStat3Label: "رضایت خریداران",
  announcement: "🎉 جشنواره تابستانه طوقی: ثبت آگهی ویژه با ۵۰٪ تخفیف — فقط تا پایان هفته!",
  aboutTitle: "درباره طوقی؛ خانه‌ی عشق‌بازان ایران",
  aboutText: "طوقی از دل عشق به کبوتر و پرندگان زینتی متولد شد. ما اینجاییم تا پرورش‌دهندگان اصیل و علاقه‌مندان را بدون واسطه به هم وصل کنیم؛ با آگهی‌های بررسی‌شده، فروشندگان احراز هویت‌شده و پشتیبانی واقعی. از کبوتر یعقوبی پا‌پر و طوق‌دار گردن‌فر تا طوطی کاسکو سخنگو و قناری رسمی‌بلند — هر پرنده‌ای که دوست دارید، اینجاست.",
  aboutImage: "/images/aviary.jpg",
  feature1Title: "فروشنده احراز هویت‌شده", feature1Text: "هویت و سابقه پرورش‌دهندگان برتر بررسی و با نشان طلایی مشخص می‌شود.",
  feature2Title: "معامله امن و بی‌واسطه", feature2Text: "مستقیم با فروشنده صحبت کنید، عکس و فیلم واقعی ببینید و با خیال راحت معامله کنید.",
  feature3Title: "تضمین سلامت پرنده", feature3Text: "آگهی‌های ویژه دارای برگه سلامت دامپزشکی و شناسنامه نژادی هستند.",
  feature4Title: "پشتیبانی عاشقانه ۲۴/۷", feature4Text: "تیم طوقی از عشق‌بازان قدیمی است؛ هر ساعت شبانه‌روز کنارتان هستیم.",
  ctaTitle: "پرنده‌ی شما هم می‌تواند ستاره‌ی بعدی طوقی باشد",
  ctaText: "همین حالا آگهی رایگان ثبت کنید، عکس‌های زیبا بگذارید و در چند دقیقه به هزاران خریدار واقعی برسید.",
  footerText: "طوقی — بازار تخصصی خرید و فروش کبوتر، پرندگان زینتی و حیوانات خانگی. ساخته‌شده با ❤️ برای عشق‌بازان ایران.",
  contactPhone: "۰۹۱۲-۰۰۰-۰۰۰۰",
  contactEmail: "salam@toghi.ir",
  contactAddress: "تهران، بازار پرندگان خلیج فارس، غرفه طوقی",
  adminPassword: "toghi123",
  guideTitle: "راهنمای خرید امن از طوقی",
  guideText: "۱) همیشه قبل از پرداخت، از فروشنده فیلم روز پرنده را بخواهید. ۲) برای خریدهای گران، معامله حضوری یا ارسال با باربری معتبر حیوانات را انتخاب کنید. ۳) شناسنامه، حلقه پا و برگه سلامت را بررسی کنید. ۴) هیچ‌وقت رمز کارت بانکی خود را برای کسی ارسال نکنید.",
};

const SEED_CATEGORIES = [
  { name:"کبوتر تزئینی و زینتی", slug:"kabootar", icon:"🕊️", image:"/images/hero-pigeon.jpg", description:"یعقوبی، طوق‌دار، دم‌چتری، لاهور و نژادهای اصیل پا‌پر", sortOrder:1 },
  { name:"کبوتر مسافتی و پلاکی", slug:"mosafeti", icon:"🏆", image:"https://images.pexels.com/photos/30360571/pexels-photo-30360571.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", description:"کبوترهای قهرمانی مسابقه‌ای با شجره‌نامه معتبر", sortOrder:2 },
  { name:"طوطی و پرندگان سخنگو", slug:"toti", icon:"🦜", image:"https://images.pexels.com/photos/28578824/pexels-photo-28578824.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", description:"کاسکو، ماکائو، عروس هلندی، ملنگو و شاه‌طوطی", sortOrder:3 },
  { name:"قناری و سهره", slug:"ghanari", icon:"🐤", image:"https://images.pexels.com/photos/11994863/pexels-photo-11994863.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", description:"قناری رسمی‌بلند، موزاییکی، سهره طلایی و فنچ", sortOrder:4 },
  { name:"مرغ عشق و فنچ", slug:"eshgh", icon:"💚", image:"https://images.pexels.com/photos/31238370/pexels-photo-31238370.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", description:"مرغ عشق سخنگو، فنچ زبرا، گلدین و جفت‌های مولد", sortOrder:5 },
  { name:"حیوانات خانگی", slug:"pets", icon:"🐾", image:"https://images.pexels.com/photos/35409275/pexels-photo-35409275.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", description:"گربه، سگ، خرگوش و همسترهای اصیل و دوست‌داشتنی", sortOrder:6 },
  { name:"قفس و لوازم", slug:"lavazem", icon:"✨", image:"https://images.pexels.com/photos/32707900/pexels-photo-32707900.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", description:"قفس لوکس، دان، مکمل، لانه و تجهیزات حرفه‌ای", sortOrder:7 },
  { name:"پرندگان شکاری و خاص", slug:"special", icon:"🦅", image:"https://images.pexels.com/photos/16907861/pexels-photo-16907861.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", description:"شاهین، جغد زینتی، طاووس و پرندگان کلکسیونی", sortOrder:8 },
];

const SEED_LISTINGS = [
  { title:"کبوتر یعقوبی سفید اصل — پا‌پر، گردن‌فر رویایی", description:"یک جفت کبوتر یعقوبی (Jacobin) خالص و وارداتی با کاکل و یقه‌ی پرِ کاملاً فر و پف‌دار، پاهای کاملاً پا‌پر و دم بلند. شناسنامه‌دار، حلقه‌دار، واکسینه و فوق‌العاده رام. ستاره‌ی هر مجموعه‌ای! ارسال به سراسر ایران با باکس مخصوص.", price:18500000, categorySlug:"kabootar", city:"تهران", image:"/images/hero-pigeon.jpg", breed:"یعقوبی (Jacobin)", age:"۱ ساله", gender:"جفت نر و ماده", featured:true, verified:true, sellerName:"مجموعه سلطنتی پرنیان", phone:"09123456780" },
  { title:"جفت کبوتر لاهور سیاه و سفید پا‌پر", description:"جفت مولد لاهور اصل پاکستانی، سرحال و تخم‌دار. پرهای پا بسیار بلند و تمیز، چشم مرواریدی. مناسب پرورش و نمایشگاه.", price:9200000, categorySlug:"kabootar", city:"مشهد", image:"/images/pigeon-pair.jpg", breed:"لاهور", age:"۲ ساله", gender:"جفت مولد", featured:true, verified:true, sellerName:"پرورشگاه لاهور مشهد", phone:"09123456781" },
  { title:"کبوتر طوق‌دار گردن‌فر (نک‌فرل) هلندی", description:"نر تک طوق‌دار اصل با گردن فر خیره‌کننده و رنگ کمیاب. برنده مقام دوم نمایشگاه کبوتران زینتی. فوق‌العاده سالم و پر انرژی.", price:14800000, categorySlug:"kabootar", city:"اصفهان", image:"https://images.pexels.com/photos/30831245/pexels-photo-30831245.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", breed:"طوق‌دار نک‌فرل", age:"۱۸ ماهه", gender:"نر", featured:true, verified:true, sellerName:"اصفهان پِت لاکچری", phone:"09123456782" },
  { title:"کاسکو سخنگو — ۴۰ کلمه، دستی و عاشق آدم", description:"کاسکوی دم‌قرمز ۳ ساله، کاملاً دستی، بیش از ۴۰ کلمه و چند جمله صحبت می‌کند. شناسنامه و تست PBFD منفی موجود است. فقط به خانواده‌ی واقعی و مهربان واگذار می‌شود.", price:68000000, categorySlug:"toti", city:"تهران", image:"https://images.pexels.com/photos/34410218/pexels-photo-34410218.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", breed:"کاسکو دم‌قرمز", age:"۳ ساله", gender:"نر", featured:true, verified:true, sellerName:"خانه طوطی تهران", phone:"09123456783" },
  { title:"ماکائو آبی‌طلایی جوجه سرلاکی", description:"جوجه ماکائوی آبی‌طلایی سرلاکی، دستی و بسیار باهوش. والدین وارداتی و موجود برای بازدید. با برگه سلامت دامپزشکی تحویل داده می‌شود.", price:145000000, categorySlug:"toti", city:"شیراز", image:"https://images.pexels.com/photos/28578824/pexels-photo-28578824.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", breed:"ماکائو آبی‌طلایی", age:"۴ ماهه", gender:"نامشخص (تست DNA دارد)", featured:true, verified:true, sellerName:"طوطی‌سرای شیراز", phone:"09123456784" },
  { title:"عروس هلندی لوتینو سخنگو و دستی", description:"عروس هلندی لوتینوی چشم‌شرابی، سوت‌زن و دستی. آهنگ‌های معروف را سوت می‌زند! همراه قفس و وسایل کامل.", price:3800000, categorySlug:"toti", city:"کرج", image:"https://images.pexels.com/photos/19904796/pexels-photo-19904796.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", breed:"عروس هلندی لوتینو", age:"۱۰ ماهه", gender:"نر", featured:false, verified:true, sellerName:"پرندگان کرج", phone:"09123456785" },
  { title:"قناری رسمی‌بلند نر مست و آوازخوان", description:"قناری رسمی‌بلند اصل، قرص و محکم، آواز صادراتی. پدر و مادر هر دو قهرمان. برای مولدگیری و مسابقه فوق‌العاده است.", price:6500000, categorySlug:"ghanari", city:"قم", image:"https://images.pexels.com/photos/11994863/pexels-photo-11994863.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", breed:"رسمی‌بلند", age:"۱ ساله", gender:"نر", featured:true, verified:false, sellerName:"قناری‌سرای قم", phone:"09123456786" },
  { title:"جفت فنچ زبرا مولد با جوجه", description:"یک جفت فنچ زبرای سالم و سرحال همراه ۳ جوجه تازه‌پرواز. بسیار پرکار و مناسب شروع پرورش خانگی.", price:850000, categorySlug:"eshgh", city:"تبریز", image:"https://images.pexels.com/photos/30316271/pexels-photo-30316271.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", breed:"فنچ زبرا", age:"۸ ماهه", gender:"جفت مولد", featured:false, verified:false, sellerName:"فنچ‌خانه تبریز", phone:"09123456787" },
  { title:"جفت مرغ عشق سخنگو انگلیسی", description:"جفت مرغ عشق نژاد انگلیسی (نمایشی) بزرگ‌جثه و رنگ کمیاب بنفش. نر سخنگو و هر دو کاملاً دستی.", price:2200000, categorySlug:"eshgh", city:"تهران", image:"https://images.pexels.com/photos/31238370/pexels-photo-31238370.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", breed:"مرغ عشق انگلیسی", age:"۷ ماهه", gender:"جفت", featured:false, verified:true, sellerName:"مرغ عشق پایتخت", phone:"09123456788" },
  { title:"کبوتر مسافتی قهرمان — نوه‌ی المپیادی", description:"کبوتر پلاکی مسافتی از لاین قهرمانان بلژیک، نوه‌ی مستقیم پرنده المپیادی. شجره‌نامه کامل، چشم مسابقه‌ای و بال‌های فوق‌العاده. رکورد ۶۰۰ کیلومتر موجود است.", price:25000000, categorySlug:"mosafeti", city:"اهواز", image:"https://images.pexels.com/photos/30360571/pexels-photo-30360571.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", breed:"پلاکی بلژیکی", age:"۲ ساله", gender:"نر", featured:true, verified:true, sellerName:"باشگاه مسافتی خوزستان", phone:"09123456789" },
  { title:"بچه‌گربه سیامی چشم‌آبی اصیل", description:"بچه‌گربه سیامی ۲ ماهه، چشم‌های آبی آسمانی، واکسن‌زده و انگل‌زدایی‌شده. بسیار بازیگوش و اجتماعی. همراه شناسنامه سلامت.", price:7500000, categorySlug:"pets", city:"تهران", image:"https://images.pexels.com/photos/35409275/pexels-photo-35409275.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", breed:"سیامی", age:"۲ ماهه", gender:"ماده", featured:true, verified:true, sellerName:"پت‌شاپ لاکچری ونک", phone:"09123456790" },
  { title:"توله پامرانین خرسی سفید", description:"توله پامرانین خرسی (بو فیس) سفید برفی، ۳ ماهه، واکسن کامل. پدر و مادر وارداتی. فوق‌العاده بامزه و مناسب آپارتمان.", price:48000000, categorySlug:"pets", city:"مشهد", image:"https://images.pexels.com/photos/20680840/pexels-photo-20680840.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", breed:"پامرانین خرسی", age:"۳ ماهه", gender:"نر", featured:false, verified:true, sellerName:"پت‌لند مشهد", phone:"09123456791" },
  { title:"قفس لوکس طلایی دست‌ساز — سایز بزرگ", description:"قفس تزئینی طلایی دست‌ساز با جزئیات سلطنتی، مناسب کبوتر زینتی و طوطی متوسط. چوب گردو و فلز آبکاری‌شده. ارسال سراسری.", price:12500000, categorySlug:"lavazem", city:"اصفهان", image:"https://images.pexels.com/photos/32707900/pexels-photo-32707900.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", breed:"قفس سلطنتی", age:"نو", gender:"—", featured:false, verified:false, sellerName:"صنایع قفس اصفهان", phone:"09123456792" },
  { title:"لوری رنگین‌کمانی دستی و بازیگوش", description:"لوری رنگین‌کمانی با رنگ‌های خیره‌کننده، کاملاً دستی و عاشق بازی. تغذیه شهد مخصوص همراه پرنده تقدیم می‌شود.", price:32000000, categorySlug:"toti", city:"رشت", image:"https://images.pexels.com/photos/29663445/pexels-photo-29663445.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", breed:"لوری رنگین‌کمانی", age:"۱ ساله", gender:"ماده", featured:false, verified:true, sellerName:"پرندگان شمال", phone:"09123456793" },
  { title:"کبوتر دم‌چتری (فن‌تیل) سفید برفی", description:"کبوتر دم‌چتری هندی اصل، دم کاملاً باز و بادبزنی، سفید یکدست. بسیار آرام و مناسب نگهداری تزئینی در باغ و ویلا.", price:5800000, categorySlug:"kabootar", city:"یزد", image:"https://images.pexels.com/photos/33636023/pexels-photo-33636023.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", breed:"دم‌چتری هندی", age:"۱۴ ماهه", gender:"ماده", featured:false, verified:false, sellerName:"کبوترخانه یزد", phone:"09123456794" },
  { title:"سهره طلایی نر سرحال و خوش‌صدا", description:"سهره طلایی صید بهار نیست؛ پرورشی و رام، رنگ‌های درخشان و صدای دلنشین. آماده‌ی جفت‌گیری.", price:1900000, categorySlug:"ghanari", city:"کرمانشاه", image:"https://images.pexels.com/photos/30594290/pexels-photo-30594290.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", breed:"سهره طلایی", age:"۹ ماهه", gender:"نر", featured:false, verified:false, sellerName:"سهره‌سرای غرب", phone:"09123456795" },
];

let seeded = false;
export async function ensureSeed() {
  if (seeded) return;
  try {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, icon TEXT NOT NULL DEFAULT '🕊️', image TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMP NOT NULL DEFAULT now())`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS listings (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', price INTEGER NOT NULL DEFAULT 0, category_slug TEXT NOT NULL DEFAULT 'kabootar', city TEXT NOT NULL DEFAULT 'تهران', image TEXT NOT NULL DEFAULT '', images JSONB NOT NULL DEFAULT '[]'::jsonb, phone TEXT NOT NULL DEFAULT '', seller_name TEXT NOT NULL DEFAULT '', breed TEXT NOT NULL DEFAULT '', age TEXT NOT NULL DEFAULT '', gender TEXT NOT NULL DEFAULT '', featured BOOLEAN NOT NULL DEFAULT false, urgent BOOLEAN NOT NULL DEFAULT false, verified BOOLEAN NOT NULL DEFAULT false, status TEXT NOT NULL DEFAULT 'active', views INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMP NOT NULL DEFAULT now())`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '')`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS inquiries (id SERIAL PRIMARY KEY, listing_id INTEGER, name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', message TEXT NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT now())`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE, national_code TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '', phone_verified BOOLEAN NOT NULL DEFAULT false, identity_verified BOOLEAN NOT NULL DEFAULT false, role TEXT NOT NULL DEFAULT 'user', created_at TIMESTAMP NOT NULL DEFAULT now())`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS otp_codes (id SERIAL PRIMARY KEY, phone TEXT NOT NULL, code TEXT NOT NULL, expires_at TIMESTAMP NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT now())`);
    await db.execute(sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS user_id INTEGER`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS province TEXT NOT NULL DEFAULT ''`);

    const catCount = await db.select({ c: sql<number>`count(*)` }).from(categories);
    if (Number(catCount[0]?.c || 0) === 0) {
      await db.insert(categories).values(SEED_CATEGORIES);
    }
    const listCount = await db.select({ c: sql<number>`count(*)` }).from(listings);
    if (Number(listCount[0]?.c || 0) === 0) {
      await db.insert(listings).values(SEED_LISTINGS.map(l => ({ ...l, images: [l.image] })));
    }
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await db.insert(siteSettings).values({ key, value }).onConflictDoNothing();
    }
    seeded = true;
  } catch (e) {
    console.error("seed error", e);
  }
}

export async function getSettings(): Promise<Record<string,string>> {
  await ensureSeed();
  const rows = await db.select().from(siteSettings);
  const out: Record<string,string> = { ...DEFAULT_SETTINGS };
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export function formatPrice(n: number) {
  if (!n) return "توافقی";
  return n.toLocaleString("fa-IR") + " تومان";
}
export function timeAgo(d: Date | string) {
  const t = new Date(d).getTime();
  const diff = Date.now() - t;
  const m = Math.floor(diff/60000);
  if (m < 1) return "همین الان";
  if (m < 60) return `${m.toLocaleString("fa-IR")} دقیقه پیش`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h.toLocaleString("fa-IR")} ساعت پیش`;
  const days = Math.floor(h/24);
  if (days < 30) return `${days.toLocaleString("fa-IR")} روز پیش`;
  return new Date(d).toLocaleDateString("fa-IR");
}
