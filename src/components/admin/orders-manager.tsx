"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { money } from "@/lib/utils";

export function OrdersManager({ orders }: { orders: any[] }) {
 const router=useRouter(); const [q,setQ]=useState(''); const [loading,setLoading]=useState('');
 const list=orders.filter(o=>`${o.trx_id} ${o.guest_email||''} ${o.sender_phone||''} ${o.products?.title_bn||''}`.toLowerCase().includes(q.toLowerCase()));
 async function update(id:string,status:string){ setLoading(id+status); const res=await fetch(`/api/admin/orders/${id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})}); setLoading(''); if(!res.ok) alert((await res.json()).error); router.refresh(); }
 return <div className="mt-6"><input className="input mb-4" placeholder="Search by TrxID/email/phone" value={q} onChange={e=>setQ(e.target.value)} /><div className="card overflow-auto"><table className="w-full min-w-[900px] text-sm"><thead className="bg-slate-100 dark:bg-slate-800"><tr><th className="p-3 text-left">Product</th><th>Customer</th><th>Payment</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody>{list.map(o=><tr key={o.id} className="border-t border-slate-200 dark:border-slate-800"><td className="p-3 font-semibold">{o.products?.title_bn}</td><td className="p-3">{o.guest_email || o.user_id}<br/><span className="text-xs text-slate-500">{o.sender_phone}</span></td><td className="p-3">{o.payment_method}<br/><b>{o.trx_id}</b></td><td className="p-3">{money(o.amount)}</td><td className="p-3">{o.status}</td><td className="p-3"><div className="flex flex-wrap gap-2"><button disabled={!!loading} onClick={()=>update(o.id,'verified')} className="rounded-xl bg-green-600 px-3 py-2 text-white">Verify</button><button disabled={!!loading} onClick={()=>update(o.id,'rejected')} className="rounded-xl bg-red-600 px-3 py-2 text-white">Reject</button><button disabled={!!loading} onClick={()=>update(o.id,'archived')} className="rounded-xl bg-slate-700 px-3 py-2 text-white">Archive</button></div></td></tr>)}</tbody></table></div></div>
}
