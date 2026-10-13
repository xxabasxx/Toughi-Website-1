import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";

export async function POST(req: NextRequest) {
  await ensureSeed();
  const b = await req.json();
  if (!b.message || !b.name) return NextResponse.json({ error:"نام و پیام الزامی است" }, { status:400 });
  const [row] = await db.insert(inquiries).values({ listingId: b.listingId ? Number(b.listingId) : null, name:b.name, phone:b.phone||"", message:b.message }).returning();
  return NextResponse.json(row);
}
