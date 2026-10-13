import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error:"فایلی انتخاب نشده" }, { status:400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length > 8 * 1024 * 1024) return NextResponse.json({ error:"حجم عکس باید کمتر از ۸ مگابایت باشد" }, { status:400 });
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g,"") || "jpg";
    const name = `toghi-${Date.now()}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive:true });
    await writeFile(path.join(dir, name), bytes);
    return NextResponse.json({ url: `/uploads/${name}` });
  } catch {
    return NextResponse.json({ error:"خطا در آپلود — می‌توانید لینک عکس را مستقیم وارد کنید" }, { status:500 });
  }
}
