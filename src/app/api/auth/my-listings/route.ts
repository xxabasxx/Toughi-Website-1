import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { currentUser, claimListings } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  await ensureSeed();
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "وارد نشده‌اید" }, { status: 401 });
  await claimListings(u.id, u.phone);
  const rows = await db.select().from(listings).where(eq(listings.userId, u.id)).orderBy(desc(listings.createdAt));
  return NextResponse.json(rows);
}
