import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { eq, sql } from "drizzle-orm";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureSeed();
  const { id } = await params;
  const [row] = await db.select().from(listings).where(eq(listings.id, Number(id)));
  if (!row) return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
  await db.update(listings).set({ views: sql`${listings.views} + 1` }).where(eq(listings.id, Number(id)));
  const cat = row.categorySlug;
  const related = await db.select().from(listings).where(eq(listings.categorySlug, cat)).limit(8);
  return NextResponse.json({ ...row, views: row.views + 1, related: related.filter(r => r.id !== row.id).slice(0,4) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureSeed();
  const { id } = await params;
  const b = await req.json();
  const allowed: Record<string, unknown> = {};
  for (const k of ["title","description","price","categorySlug","city","image","images","phone","sellerName","breed","age","gender","featured","urgent","verified","status"]) {
    if (k in b) allowed[k] = k === "price" ? Number(b[k]) : b[k];
  }
  if (allowed.image && !allowed.images) allowed.images = [allowed.image as string];
  const [row] = await db.update(listings).set(allowed).where(eq(listings.id, Number(id))).returning();
  return NextResponse.json(row);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureSeed();
  const { id } = await params;
  await db.delete(listings).where(eq(listings.id, Number(id)));
  return NextResponse.json({ ok: true });
}
