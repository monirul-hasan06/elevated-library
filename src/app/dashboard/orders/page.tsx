import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { money } from "@/lib/utils";

export default async function MyOrdersPage(){
  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("orders").select("*, products(title_bn,title_en,slug)").eq("user_id", user.id).order("created_at", { ascending: false });
  return <div><h1 className="text-3xl font-black">My Orders</h1><div className="mt-6 space-y-4">{(data||[]).map((o:any)=><div key={o.id} className="card p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-black">{o.products?.title_bn}</h2><p className="text-sm text-slate-500">TrxID: {o.trx_id} • {money(o.amount)}</p></div><span className="badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{o.status}</span></div>{o.status==='verified'?<Link href={`/api/download?orderId=${o.id}`} className="btn-primary mt-4">Download</Link>:null}</div>)}{!data?.length?<div className="card p-8 text-center">No orders yet.</div>:null}</div></div>
}
