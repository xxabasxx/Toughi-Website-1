import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { readToken, toEn, validNationalCode, makeToken, claimListings, publicUser, authCookieOptions, TOKEN_COOKIE, PENDING_COOKIE } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  await ensureSeed();
  const b = await req.json().catch(() => ({}));

  // پیدا کردن نشست موقت تایید موبایل: اول از کوکی، بعد از توکن ارسالی مرورگر (پشتیبان)
  const jar = await cookies();
  let pending = readToken(jar.get(PENDING_COOKIE)?.value);
  if (!pending?.pending) {
    const h = await headers();
    const auth = h.get("authorization") || "";
    if (auth.startsWith("Bearer ")) pending = readToken(auth.slice(7));
    if (!pending?.pending && typeof b.pendingToken === "string") pending = readToken(b.pendingToken);
  }
  if (!pending?.pending || !pending.phone) {
    return NextResponse.json({ error: "نشست تایید موبایل پیدا نشد — لطفاً دوباره شماره موبایل را وارد و کد جدید بگیرید", expired: true }, { status: 401 });
  }

  const nationalCode = toEn(b.nationalCode || "").replace(/\D/g, "");
  if (!b.name || String(b.name).trim().length < 3) return NextResponse.json({ error: "نام و نام خانوادگی کامل را وارد کنید" }, { status: 400 });
  if (!validNationalCode(nationalCode)) return NextResponse.json({ error: "کد ملی معتبر نیست — کد ملی ۱۰ رقمی صحیح را وارد کنید" }, { status: 400 });

  const phone = pending.phone;
  const [exists] = await db.select().from(users).where(eq(users.phone, phone));
  if (exists) return NextResponse.json({ error: "این شماره قبلاً ثبت‌نام کرده است؛ کافی است وارد شوید" }, { status: 409 });

  // احراز هویت: موبایل با کد پیامکی تایید شد + کد ملی با الگوریتم رسمی اعتبارسنجی شد
  const [user] = await db.insert(users).values({
    name: String(b.name).trim(), phone, nationalCode,
    province: String(b.province || ""), city: String(b.city || ""),
    phoneVerified: true, identityVerified: true,
  }).returning();

  await claimListings(user.id, phone);
  const token = makeToken({ uid: user.id, exp: Date.now() + 30 * 24 * 3600 * 1000 });
  const res = NextResponse.json({ ok: true, token, user: publicUser(user) });
  res.cookies.set(TOKEN_COOKIE, token, authCookieOptions(30 * 24 * 3600));
  res.cookies.set(PENDING_COOKIE, "", authCookieOptions(0));
  return res;
}
