import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { currentUser, publicUser, toEn, validNationalCode } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  await ensureSeed();
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "وارد نشده‌اید" }, { status: 401 });
  return NextResponse.json({ user: publicUser(u) });
}

export async function PATCH(req: NextRequest) {
  await ensureSeed();
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "وارد نشده‌اید" }, { status: 401 });
  const b = await req.json();
  const patch: Partial<typeof users.$inferInsert> = {};
  if (typeof b.name === "string" && b.name.trim().length >= 3) patch.name = b.name.trim();
  if (typeof b.province === "string") patch.province = b.province;
  if (typeof b.city === "string") patch.city = b.city;
  if (typeof b.nationalCode === "string" && b.nationalCode.trim()) {
    const code = toEn(b.nationalCode).replace(/\D/g, "");
    if (!validNationalCode(code)) return NextResponse.json({ error: "کد ملی معتبر نیست" }, { status: 400 });
    patch.nationalCode = code;
    patch.identityVerified = true;
  }
  if (!Object.keys(patch).length) return NextResponse.json({ error: "تغییری ارسال نشد" }, { status: 400 });
  const [row] = await db.update(users).set(patch).where(eq(users.id, u.id)).returning();
  return NextResponse.json({ user: publicUser(row) });
}
