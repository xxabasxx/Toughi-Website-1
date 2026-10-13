import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listings, categories, inquiries } from "@/db/schema";
import { getSettings, ensureSeed } from "@/lib/seed";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const s = await getSettings();
  if (password === (s.adminPassword || "toghi123")) return NextResponse.json({ ok:true });
  return NextResponse.json({ error:"رمز عبور اشتباه است" }, { status:401 });
}
export async function GET() {
  await ensureSeed();
  const [l] = await db.select({ c: sql<number>`count(*)` }).from(listings);
  const [a] = await db.select({ c: sql<number>`count(*)` }).from(listings).where(sql`status='active'`);
  const [f] = await db.select({ c: sql<number>`count(*)` }).from(listings).where(sql`featured=true`);
  const [v] = await db.select({ c: sql<number>`coalesce(sum(views),0)` }).from(listings);
  const [c] = await db.select({ c: sql<number>`count(*)` }).from(categories);
  const [inq] = await db.select({ c: sql<number>`count(*)` }).from(inquiries);
  const recentInquiries = await db.select().from(inquiries).orderBy(sql`created_at desc`).limit(20);
  return NextResponse.json({ listings:Number(l.c), active:Number(a.c), featured:Number(f.c), views:Number(v.c), categories:Number(c.c), inquiriesCount:Number(inq.c), recentInquiries });
}
