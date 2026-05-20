"use client";

import { useState } from "react";
import Image from "next/image";
import { Bell } from "lucide-react";
import { T } from "@/components/shared/language-theme-provider";
import { money } from "@/lib/utils";

export function ComingSoonClient({ items }: { items: any[] }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    if (!selected) return;
    setLoading(true); setMessage("");
    try {
      const res = await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ upcomingPdfId: selected.id, guestEmail: email, guestPhone: phone }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setMessage("Alert turned on! PDF publish হলে আপনাকে notify করা হবে।");
      setEmail(""); setPhone("");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setLoading(false); }
  }

  return <main className="container-page py-12"><h1 className="text-4xl font-black">Coming Soon PDFs</h1><p className="mt-3 text-slate-600 dark:text-slate-300">Specific PDF-এর জন্য Notify Me on করে রাখুন।</p><div className="mt-8 grid gap-6 md:grid-cols-3">{items.map(item => <article key={item.id} className="card overflow-hidden"><div className="relative aspect-[4/3] bg-brand-50"><Image src={item.cover_url || "/placeholder.svg"} alt={item.title_en} fill className="object-cover" /></div><div className="p-5"><span className="badge bg-amber-100 text-amber-700">Coming Soon</span><h2 className="mt-4 text-xl font-black"><T bn={item.title_bn} en={item.title_en} /></h2><p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300"><T bn={item.description_bn} en={item.description_en} /></p><p className="mt-4 text-sm text-slate-500">Expected: {item.expected_release_date || "TBA"}</p><p className="text-sm text-slate-500">Price: {item.estimated_price ? money(item.estimated_price) : "TBA"}</p><button onClick={() => { setSelected(item); setMessage(""); }} className="btn-primary mt-5 w-full"><Bell className="mr-2 h-4 w-4" /> Notify Me</button></div></article>)}</div>{selected ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><div className="card w-full max-w-md p-6"><h2 className="text-2xl font-black">Notify Me</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-300"><T bn={selected.title_bn} en={selected.title_en} /></p><input className="input mt-5" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} /><input className="input mt-3" placeholder="Phone optional" value={phone} onChange={(e)=>setPhone(e.target.value)} />{message ? <p className="mt-3 rounded-2xl bg-slate-100 p-3 text-sm dark:bg-slate-800">{message}</p> : null}<div className="mt-5 flex gap-3"><button className="btn-primary flex-1" disabled={loading} onClick={subscribe}>{loading ? "Saving..." : "Turn On Alert"}</button><button className="btn-secondary" onClick={() => setSelected(null)}>Close</button></div></div></div> : null}</main>;
}
