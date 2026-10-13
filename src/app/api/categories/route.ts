import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, listings } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { asc, eq, sql } from "drizzle-orm";

export async function GET() {
  await ensureSeed();
  const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  const counts = await db.select({ slug: listings.categorySlug, c: sql<number>`count(*)` }).from(listings).where(eq(listings.status,"active")).groupBy(listings.categorySlug);
  const map = new Map(counts.map(x=>[x.slug, Number(x.c)]));
  return NextResponse.json(cats.map(c=>({ ...c, count: map.get(c.slug)||0 })));
}
export async function POST(req: NextRequest) {
  await ensureSeed();
  const b = await req.json();
  if (!b.name) return NextResponse.json({ error:"نام دسته الزامی است" }, { status:400 });
  const slug = (b.slug || b.name).toString().trim().replace(/\s+/g,"-") + "-" + Date.now().toString(36);
  const [row] = await db.insert(categories).values({ name:b.name, slug: b.slug || slug, icon:b.icon||"🕊️", image:b.image||"", description:b.description||"", sortOrder:Number(b.sortOrder||9) }).returning();
  return NextResponse.json(row);
}
export async function PATCH(req: NextRequest) {
  await ensureSeed();
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error:"شناسه دسته نیست" }, { status:400 });
  const patch: Record<string, unknown> = {};
  for (const k of ["name","icon","image","description","sortOrder"]) if (k in b) patch[k] = b[k];
  const [row] = await db.update(categories).set(patch).where(eq(categories.id, Number(b.id))).returning();
  return NextResponse.json(row);
}
export async function DELETE(req: NextRequest) {
  await ensureSeed();
  const id = Number(req.nextUrl.searchParams.get("id"));
  await db.delete(categories).where(eq(categories.id, id));
  return NextResponse.json({ ok:true });
}
