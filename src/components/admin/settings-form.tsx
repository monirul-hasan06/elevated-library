"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SettingsForm({ settings }: { settings: any }) {
 const router=useRouter(); const [form,setForm]=useState(settings||{}); const [msg,setMsg]=useState('');
 function set(k:string,v:any){setForm((f:any)=>({...f,[k]:v}))}
 async function save(e:React.FormEvent){e.preventDefault(); const res=await fetch('/api/admin/settings',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}); const json=await res.json(); if(!res.ok) setMsg(json.error); else {setMsg('Saved'); router.refresh();}}
 const input=(k:string,l:string)=><div><label className="text-sm font-semibold">{l}</label><input className="input mt-1" value={form[k]||''} onChange={e=>set(k,e.target.value)}/></div>;
 const area=(k:string,l:string)=><div><label className="text-sm font-semibold">{l}</label><textarea className="input mt-1 min-h-24" value={form[k]||''} onChange={e=>set(k,e.target.value)}/></div>;
 return <form onSubmit={save} className="card mt-6 grid gap-4 p-6 md:grid-cols-2">{input('site_name','Site Name')}{input('owner_email','Owner Email')}{input('facebook_url','Facebook URL')}{input('messenger_url','Messenger URL')}{input('logo_url','Logo URL')}{input('favicon_url','Favicon URL')}{input('primary_color','Primary Color')}{input('default_language','Default Language')}{input('default_theme','Default Theme')}{area('hero_title_bn','Hero Title BN')}{area('hero_title_en','Hero Title EN')}{area('hero_subtitle_bn','Hero Subtitle BN')}{area('hero_subtitle_en','Hero Subtitle EN')}{input('hero_button_bn','Hero Button BN')}{input('hero_button_en','Hero Button EN')}{area('footer_description_bn','Footer BN')}{area('footer_description_en','Footer EN')}{area('support_text_bn','Support Text BN')}{area('support_text_en','Support Text EN')}<div className="md:col-span-2">{msg?<p className="mb-3 rounded-2xl bg-slate-100 p-3 text-sm dark:bg-slate-800">{msg}</p>:null}<button className="btn-primary">Save Settings</button></div></form>
}
