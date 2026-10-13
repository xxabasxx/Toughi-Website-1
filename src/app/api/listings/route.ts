import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { desc, eq, and, ilike, or, gte, lte, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  await ensureSeed();
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") || "";
  const cat = sp.get("cat") || "";
  const city = sp.get("city") || "";
  const sort = sp.get("sort") || "newest";
  const featured = sp.get("featured");
  const min = Number(sp.get("min") || 0);
  const max = Number(sp.get("max") || 0);
  const all = sp.get("all"); // admin

  const conds = [];
  if (!all) conds.push(eq(listings.status, "active"));
  if (cat) conds.push(eq(listings.categorySlug, cat));
  if (city && city !== "همه شهرها") conds.push(eq(listings.city, city));
  if (featured === "1") conds.push(eq(listings.featured, true));
  if (min) conds.push(gte(listings.price, min));
  if (max) conds.push(lte(listings.price, max));
  if (q) conds.push(or(ilike(listings.title, `%${q}%`), ilike(listings.description, `%${q}%`), ilike(listings.breed, `%${q}%`), ilike(listings.city, `%${q}%`)));

  let order = desc(listings.createdAt);
  if (sort === "cheapest") order = sql`${listings.price} asc`;
  if (sort === "expensive") order = desc(listings.price);
  if (sort === "popular") order = desc(listings.views);

  const rows = await db.select().from(listings).where(conds.length ? and(...conds) : undefined).orderBy(sql`${listings.featured} desc`, order).limit(200);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await ensureSeed();
  const b = await req.json();
  if (!b.title) return NextResponse.json({ error: "عنوان آگهی الزامی است" }, { status: 400 });
  const { currentUser } = await import("@/lib/auth");
  const user = await currentUser().catch(() => null);
  const img = b.image || "/images/hero-pigeon.jpg";
  const [row] = await db.insert(listings).values({
    userId: user?.id ?? null,
    title: b.title, description: b.description || "", price: Number(b.price || 0),
    categorySlug: b.categorySlug || "kabootar", city: b.city || "تهران",
    image: img, images: Array.isArray(b.images) && b.images.length ? b.images : [img],
    phone: b.phone || user?.phone || "", sellerName: b.sellerName || user?.name || "کاربر طوقی",
    verified: user ? true : !!b.verified,
    breed: b.breed || "", age: b.age || "", gender: b.gender || "نامشخص",
    featured: !!b.featured, urgent: !!b.urgent,
    status: b.status || "active",
  }).returning();
  return NextResponse.json(row);
}
