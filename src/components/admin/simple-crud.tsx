"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Field = { key: string; label: string; type?: "text" | "number" | "textarea" | "select" | "checkbox" | "date"; options?: string[] };

export function SimpleCrud({ title, resource, rows, fields }: { title: string; resource: string; rows: any[]; fields: Field[] }) {
  const router = useRouter();
  const empty = Object.fromEntries(
  fields.map((f) => [
    f.key,
    f.type === "checkbox"
      ? false
      : f.type === "select"
        ? f.options?.[0] ?? ""
        : ""
  ])
);
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  function setField(k:string,v:any){ setForm((f:any)=>({...f,[k]:v})); }
  function normalizePayload() {
    const payload: any = {};
    fields.forEach((f) => {
      const value = form[f.key];
      if (f.type === 'number') payload[f.key] = value === '' || value === null || value === undefined ? (f.key === 'sort_order' ? 0 : null) : Number(value);
      else if (f.type === 'checkbox') payload[f.key] = !!value;
      else if (f.type === 'date') payload[f.key] = value || null;
      else payload[f.key] = value;
    });
    return payload;
  }
  async function save(e:React.FormEvent){ e.preventDefault(); setMessage(''); const url=editId?`/api/admin/simple/${resource}/${editId}`:`/api/admin/simple/${resource}`; const res=await fetch(url,{method:editId?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(normalizePayload())}); const json=await res.json(); if(!res.ok) return setMessage(json.error||'Failed'); setForm(empty); setEditId(null); router.refresh(); }
  async function remove(id:string){ if(!confirm('Delete/Archive this item?')) return; const res=await fetch(`/api/admin/simple/${resource}/${id}`,{method:'DELETE'}); if(!res.ok) alert((await res.json()).error); router.refresh(); }
  return <div><h1 className="text-3xl font-black">{title}</h1><form onSubmit={save} className="card mt-6 grid gap-4 p-5 md:grid-cols-2">{fields.map(f=><div key={f.key} className={f.type==='textarea'?'md:col-span-2':''}><label className="text-sm font-semibold">{f.label}</label>{f.type==='textarea'?<textarea className="input mt-1 min-h-24" value={form[f.key]||''} onChange={e=>setField(f.key,e.target.value)} />:f.type==='select'?<select
  className="input mt-1"
  value={form[f.key] || f.options?.[0] || ""}
  onChange={(e) => setField(f.key, e.target.value)}
>
  {(f.options || []).map((o) => (
    <option key={o} value={o}>
      {o}
    </option>
  ))}
</select>:f.type==='checkbox'?<input className="mt-3" type="checkbox" checked={!!form[f.key]} onChange={e=>setField(f.key,e.target.checked)} />:<input className="input mt-1" type={f.type||'text'} value={form[f.key]||''} onChange={e=>setField(f.key,e.target.value)} />}</div>)}<div className="md:col-span-2">{message?<p className="mb-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{message}</p>:null}<button className="btn-primary">{editId?'Update':'Add'} {title}</button>{editId?<button type="button" onClick={()=>{setEditId(null);setForm(empty)}} className="btn-secondary ml-2">Cancel</button>:null}</div></form><div className="card mt-6 overflow-auto"><table className="w-full min-w-[800px] text-sm"><thead className="bg-slate-100 dark:bg-slate-800"><tr>{fields.slice(0,4).map(f=><th key={f.key} className="p-3 text-left">{f.label}</th>)}<th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>{rows.map(row=><tr key={row.id} className="border-t border-slate-200 dark:border-slate-800">{fields.slice(0,4).map(f=><td key={f.key} className="p-3">{String(row[f.key] ?? '')}</td>)}<td className="p-3 text-center">{row.status}</td><td className="p-3"><button onClick={()=>{setEditId(row.id);setForm(Object.fromEntries(fields.map(f=>[f.key,row[f.key] ?? (f.type==='checkbox'?false:'')])));}} className="font-bold text-brand-700">Edit</button><button onClick={()=>remove(row.id)} className="ml-4 font-bold text-red-600">Delete</button></td></tr>)}</tbody></table></div></div>
}
