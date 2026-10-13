import { NextResponse } from "next/server";
import { TOKEN_COOKIE, PENDING_COOKIE, authCookieOptions } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(TOKEN_COOKIE, "", authCookieOptions(0));
  res.cookies.set(PENDING_COOKIE, "", authCookieOptions(0));
  return res;
}
