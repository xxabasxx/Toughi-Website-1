import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { validPhone, toEn, sendOtpSms } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  await ensureSeed();
  const { phone: raw } = await req.json();
  const phone = toEn(raw || "").trim();
  if (!validPhone(phone)) return NextResponse.json({ error: "شماره موبایل معتبر نیست — مثال: 09123456789" }, { status: 400 });

  // محدودیت ارسال مجدد: هر ۶۰ ثانیه یک کد
  const [last] = await db.select().from(otpCodes).where(eq(otpCodes.phone, phone)).orderBy(desc(otpCodes.createdAt)).limit(1);
  if (last && Date.now() - new Date(last.createdAt).getTime() < 60_000) {
    return NextResponse.json({ error: "کد قبلاً ارسال شده؛ برای دریافت کد جدید ۱ دقیقه صبر کنید" }, { status: 429 });
  }

  const code = Math.floor(10000 + Math.random() * 90000).toString();
  await db.insert(otpCodes).values({ phone, code, expiresAt: new Date(Date.now() + 2 * 60 * 1000) });

  const sentBySms = await sendOtpSms(phone, code);
  // اگر درگاه پیامک (KAVENEGAR_API_KEY) روی سرور تنظیم نشده باشد، کد برای تست روی صفحه نمایش داده می‌شود
  return NextResponse.json({ ok: true, sms: sentBySms, devCode: sentBySms ? undefined : code });
}
