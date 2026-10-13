import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull().default("🕊️"),
  image: text("image").notNull().default(""),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  nationalCode: text("national_code").notNull().default(""),
  province: text("province").notNull().default(""),
  city: text("city").notNull().default(""),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  identityVerified: boolean("identity_verified").notNull().default(false),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull().default(0), // 0 = توافقی
  categorySlug: text("category_slug").notNull().default("kabootar"),
  city: text("city").notNull().default("تهران"),
  image: text("image").notNull().default(""),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  phone: text("phone").notNull().default("09120000000"),
  sellerName: text("seller_name").notNull().default("فروشنده طوقی"),
  breed: text("breed").notNull().default(""),
  age: text("age").notNull().default(""),
  gender: text("gender").notNull().default("نامشخص"),
  featured: boolean("featured").notNull().default(false),
  urgent: boolean("urgent").notNull().default(false),
  verified: boolean("verified").notNull().default(false),
  status: text("status").notNull().default("active"), // active | pending | sold | hidden
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id"),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Listing = typeof listings.$inferSelect;
export type Category = typeof categories.$inferSelect;
