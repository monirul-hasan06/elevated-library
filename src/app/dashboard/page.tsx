import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = createSupabaseServerClient();
  const { data: orders } = await supabase.from("orders").select("status").eq("user_id", user.id);
  return <div><h1 className="text-3xl font-black">Dashboard</h1><div className="mt-6 grid gap-4 sm:grid-cols-3"><Stat label="Total Orders" value={orders?.length || 0}/><Stat label="Verified" value={orders?.filter(o=>o.status==='verified').length || 0}/><Stat label="Pending" value={orders?.filter(o=>o.status==='pending').length || 0}/></div></div>;
}
function Stat({label,value}:{label:string;value:number}){return <div className="card p-6"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>}
