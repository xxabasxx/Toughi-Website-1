// نگهداری توکن ورود در مرورگر + ارسال خودکار آن در درخواست‌ها (پشتیبان کوکی، برای اینکه ورود هیچ‌وقت بی‌دلیل قطع نشود)
const KEY = "toghi-token";
const PKEY = "toghi-pending-token";

export function getToken(): string {
  try { return localStorage.getItem(KEY) || ""; } catch { return ""; }
}
export function setToken(t: string) {
  try { if (t) localStorage.setItem(KEY, t); } catch {}
}
export function clearToken() {
  try { localStorage.removeItem(KEY); localStorage.removeItem(PKEY); } catch {}
}
export function getPendingToken(): string {
  try { return localStorage.getItem(PKEY) || ""; } catch { return ""; }
}
export function setPendingToken(t: string) {
  try { if (t) localStorage.setItem(PKEY, t); } catch {}
}
export function clearPendingToken() {
  try { localStorage.removeItem(PKEY); } catch {}
}

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const token = getToken();
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
