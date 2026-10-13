import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings, listings, categories, inquiries } from "@/db/schema";
import { getSettings, ensureSeed } from "@/lib/seed";
import { sql } from "drizzle-orm";

export async function GET() {
  const s = await getSettings();
  const { adminPassword, ...pub } = s;
  void adminPassword;
  return NextResponse.json(pub);
}
export async function PUT(req: NextRequest) {
  await ensureSeed();
  const b = await req.json();
  for (const [k,v] of Object.entries(b)) {
    if (typeof v === "string") {
      await db.insert(siteSettings).values({ key:k, value:v }).onConflictDoUpdate({ target: siteSettings.key, set:{ value:v } });
    }
  }
  return NextResponse.json({ ok:true });
}
