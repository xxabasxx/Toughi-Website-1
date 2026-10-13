import crypto from "crypto";
import { cookies, headers } from "next/headers";

// تنظیمات کوکی ورود — در محیط ابری (https) طوری تنظیم می‌شود که داخل فریم پیش‌نمایش و روی موبایل هم همیشه ارسال شود
export function authCookieOptions(maxAge: number) {
  const prod = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    path: "/",
    maxAge,
    sameSite: prod ? ("none" as const) : ("lax" as const),
    secure: prod,
  };
}
import { db } from "@/db";
import { users, listings } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

const SECRET = process.env.AUTH_SECRET || "toghi-super-secret-change-in-production";
export const TOKEN_COOKIE = "toghi_token";
export const PENDING_COOKIE = "toghi_pending";

type Payload = { uid?: number; phone?: string; pending?: boolean; exp?: number };

function sign(data: string) {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}
export function makeToken(payload: Payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}
export function readToken(token?: string | null): Payload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig || sign(body) !== sig) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (p.exp && Date.now() > p.exp) return null;
    return p;
  } catch { return null; }
}

export async function currentUser() {
  try {
    const c = await cookies();
    let p = readToken(c.get(TOKEN_COOKIE)?.value);
    // پشتیبان: اگر کوکی به هر دلیلی ارسال نشد، توکن ذخیره‌شده در مرورگر (هدر Authorization) بررسی می‌شود
    if (!p?.uid) {
      const h = await headers();
      const auth = h.get("authorization") || "";
      if (auth.startsWith("Bearer ")) p = readToken(auth.slice(7));
    }
    if (!p?.uid) return null;
    const [u] = await db.select().from(users).where(eq(users.id, p.uid));
    return u || null;
  } catch { return null; }
}

export function toEn(s: string) {
  return (s || "")
    .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
    .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
}
export function validPhone(p: string) {
  return /^09\d{9}$/.test(toEn(p || "").trim());
}
// اعتبارسنجی واقعی کد ملی ایران با الگوریتم رقم کنترلی
export function validNationalCode(input: string) {
  const code = toEn(input || "").replace(/\D/g, "");
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;
  const check = Number(code[9]);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(code[i]) * (10 - i);
  const r = sum % 11;
  return (r < 2 && check === r) || (r >= 2 && check === 11 - r);
}

// ارسال پیامک واقعی از طریق کاوه‌نگار — کافی است KAVENEGAR_API_KEY در .env سرور قرار گیرد
export async function sendOtpSms(phone: string, code: string) {
  const key = process.env.KAVENEGAR_API_KEY;
  if (!key) return false;
  try {
    const message = `طوقی 🕊️\nکد تایید شما: ${code}\nاین کد را در اختیار هیچ‌کس قرار ندهید.`;
    const r = await fetch(`https://api.kavenegar.com/v1/${key}/sms/send.json`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ receptor: phone, message }),
    });
    return r.ok;
  } catch { return false; }
}

// آگهی‌هایی که با این شماره ثبت شده‌اند به حساب کاربر وصل می‌شوند
export async function claimListings(userId: number, phone: string) {
  try {
    await db.update(listings).set({ userId }).where(and(eq(listings.phone, phone), isNull(listings.userId)));
  } catch {}
}

export function publicUser(u: typeof users.$inferSelect) {
  return {
    id: u.id, name: u.name, phone: u.phone, province: u.province || "", city: u.city, role: u.role,
    phoneVerified: u.phoneVerified, identityVerified: u.identityVerified,
    hasNationalCode: !!u.nationalCode,
    nationalCodeMasked: u.nationalCode ? `••••••${toEn(u.nationalCode).slice(-4)}` : "",
    createdAt: u.createdAt,
  };
}
