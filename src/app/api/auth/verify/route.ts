import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { otpCodes, users } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { toEn, makeToken, claimListings, publicUser, authCookieOptions, TOKEN_COOKIE, PENDING_COOKIE } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  await ensureSeed();
  const { phone: rawPhone, code: rawCode } = await req.json();
  const phone = toEn(rawPhone || "").trim();
  const code = toEn(rawCode || "").trim();
  if (!phone || !code) return NextResponse.json({ error: "شماره و کد تایید را وارد کنید" }, { status: 400 });

  const [row] = await db.select().from(otpCodes).where(eq(otpCodes.phone, phone)).orderBy(desc(otpCodes.createdAt)).limit(1);
  if (!row || row.code !== code) return NextResponse.json({ error: "کد تایید اشتباه است — کد پیامک‌شده را دقیق وارد کنید" }, { status: 400 });
  if (new Date(row.expiresAt).getTime() < Date.now()) return NextResponse.json({ error: "کد منقضی شده؛ یک کد جدید بگیرید" }, { status: 400 });

  await db.delete(otpCodes).where(eq(otpCodes.phone, phone));
  const [user] = await db.select().from(users).where(eq(users.phone, phone));

  if (user) {
    if (!user.phoneVerified) await db.update(users).set({ phoneVerified: true }).where(eq(users.id, user.id));
    await claimListings(user.id, phone);
    const token = makeToken({ uid: user.id, exp: Date.now() + 30 * 24 * 3600 * 1000 });
    const res = NextResponse.json({ ok: true, token, user: publicUser({ ...user, phoneVerified: true }) });
    res.cookies.set(TOKEN_COOKIE, token, authCookieOptions(30 * 24 * 3600));
    res.cookies.set(PENDING_COOKIE, "", authCookieOptions(0));
    return res;
  }

  // کاربر جدید: نشست موقت ۱۵ دقیقه‌ای برای تکمیل نام و کد ملی (احراز هویت)
  const pendingToken = makeToken({ phone, pending: true, exp: Date.now() + 15 * 60 * 1000 });
  const res = NextResponse.json({ ok: true, needProfile: true, phone, pendingToken });
  res.cookies.set(PENDING_COOKIE, pendingToken, authCookieOptions(15 * 60));
  return res;
}
