"use client";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Link2 } from "lucide-react";

export default function ImageUpload({ value, onChange, label = "عکس" }: { value: string; onChange: (url: string) => void; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const upload = async (f: File) => {
    setBusy(true); setErr("");
    try {
      const fd = new FormData(); fd.append("file", f);
      const r = await fetch("/api/upload", { method:"POST", body: fd });
      const d = await r.json();
      if (d.url) onChange(d.url); else setErr(d.error || "خطا در آپلود");
    } catch { setErr("آپلود نشد؛ لینک عکس را دستی وارد کنید"); }
    setBusy(false);
  };
  return (
    <div>
      <label className="block text-sm font-black text-[#0b3d2e] mb-2">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
          <input value={value} onChange={e=>onChange(e.target.value)} placeholder="لینک عکس یا آپلود از گالری..." className="w-full bg-white ring-1 ring-[#e8dcbb] rounded-2xl py-3 pr-9 pl-3 text-sm" dir="ltr" style={{textAlign:"left"}}/>
        </div>
        <button type="button" onClick={()=>ref.current?.click()} className="shrink-0 bg-[#0b3d2e] text-[#e8c766] px-4 rounded-2xl font-black text-sm flex items-center gap-1.5">
          {busy ? <Loader2 className="animate-spin" size={17}/> : <ImagePlus size={17}/>} آپلود
        </button>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) upload(f); }}/>
      </div>
      {err && <p className="text-xs text-red-500 font-bold mt-1.5">{err}</p>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mt-3 w-full h-44 object-cover rounded-3xl ring-2 ring-[#c9a227]/40"/>
      )}
    </div>
  );
}
