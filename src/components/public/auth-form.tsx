"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthForm({ mode, redirectTo }: { mode: "login" | "register"; redirectTo: string }) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMessage("");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirectTo);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } });
        if (error) throw error;
        setMessage("Account created. Email confirmation লাগলে inbox check করুন, তারপর login করুন।");
      }
    } catch (e) { setMessage(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setLoading(false); }
  }

  return <main className="container-page flex min-h-[70vh] items-center justify-center py-12"><form onSubmit={submit} className="card w-full max-w-md p-8"><h1 className="text-3xl font-black">{mode === "login" ? "Login" : "Create Account"}</h1>{mode === "register" ? <input className="input mt-6" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} /> : null}<input className="input mt-4" type="email" required placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} /><input className="input mt-4" type="password" required minLength={6} placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />{message ? <p className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm dark:bg-slate-800">{message}</p> : null}<button className="btn-primary mt-6 w-full" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}</button><p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">{mode === "login" ? <>No account? <Link className="font-bold text-brand-700" href="/register">Register</Link></> : <>Already have account? <Link className="font-bold text-brand-700" href="/login">Login</Link></>}</p></form></main>;
}
