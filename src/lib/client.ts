export type ListingT = {
  id: number; title: string; description: string; price: number; categorySlug: string;
  city: string; image: string; images?: string[]; phone: string; sellerName: string;
  breed: string; age: string; gender: string; featured: boolean; urgent: boolean;
  verified: boolean; status: string; views: number; createdAt: string;
};
export type CategoryT = { id:number; name:string; slug:string; icon:string; image:string; description:string; sortOrder:number };

export function formatPrice(n: number) {
  if (!n) return "توافقی";
  return n.toLocaleString("fa-IR") + " تومان";
}
export function timeAgo(d: Date | string) {
  const t = new Date(d).getTime();
  const diff = Date.now() - t;
  const m = Math.floor(diff/60000);
  if (m < 1) return "همین الان";
  if (m < 60) return `${m.toLocaleString("fa-IR")} دقیقه پیش`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h.toLocaleString("fa-IR")} ساعت پیش`;
  const days = Math.floor(h/24);
  if (days < 30) return `${days.toLocaleString("fa-IR")} روز پیش`;
  return new Date(d).toLocaleDateString("fa-IR");
}
