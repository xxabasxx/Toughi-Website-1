import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { getSettings } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings().catch(() => ({} as Record<string,string>));
  return {
    title: `${s.siteName || "طوقی"} | ${s.tagline || "بازار لوکس کبوتر و پرندگان"}`,
    description: s.heroSubtitle || "خرید و فروش کبوتر تزئینی، طوطی سخنگو، قناری و حیوانات خانگی در ایران",
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  let settings: Record<string,string> = {};
  try { settings = await getSettings(); } catch {}
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <Header settings={settings} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
        <div aria-hidden className="h-[86px] bg-[#faf6ec]" />
        <BottomNav />
      </body>
    </html>
  );
}
