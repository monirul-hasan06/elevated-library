import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminPage(){
 const supabase=createSupabaseAdminClient();
 const [{count:orders},{count:products},{count:pending},{data:revenue}] = await Promise.all([
  supabase.from('orders').select('*',{count:'exact',head:true}),
  supabase.from('products').select('*',{count:'exact',head:true}).neq('status','deleted'),
  supabase.from('orders').select('*',{count:'exact',head:true}).eq('status','pending'),
  supabase.from('orders').select('amount').eq('status','verified')
 ]);
 const total=(revenue||[]).reduce((s:any,o:any)=>s+Number(o.amount||0),0);
 return <div><h1 className="text-3xl font-black">Dashboard Overview</h1><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Total Orders" value={orders||0}/><Stat label="Pending" value={pending||0}/><Stat label="Products" value={products||0}/><Stat label="Revenue" value={`৳${total.toFixed(0)}`}/></div></div>
}
function Stat({label,value}:{label:string;value:any}){return <div className="card p-6"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>}
