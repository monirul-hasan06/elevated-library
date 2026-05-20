import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MyAlertsPage(){
 const user=await requireUser(); const supabase=createSupabaseServerClient();
 const {data}=await supabase.from("notify_subscribers").select("*, upcoming_pdfs(title_bn,title_en,status)").eq("user_id",user.id).order("created_at",{ascending:false});
 return <div><h1 className="text-3xl font-black">My Notify Alerts</h1><div className="mt-6 space-y-4">{(data||[]).map((n:any)=><div className="card p-5" key={n.id}><h2 className="font-black">{n.upcoming_pdfs?.title_bn}</h2><p className="mt-1 text-sm text-slate-500">Status: {n.status}</p></div>)}{!data?.length?<div className="card p-8 text-center">No alerts yet.</div>:null}</div></div>
}
