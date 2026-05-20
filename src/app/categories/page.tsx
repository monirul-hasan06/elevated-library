import Link from "next/link";
import { T } from "@/components/shared/language-theme-provider";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function CategoriesPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("categories").select("*").eq("status", "active").order("sort_order");
  return <main className="container-page py-12"><h1 className="text-4xl font-black">Categories</h1><p className="mt-3 text-slate-600 dark:text-slate-300">আপনার growth journey অনুযায়ী PDF বেছে নিন।</p><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{(data || []).map((c: any) => <Link href={`/categories/${c.slug}`} key={c.id} className="card p-6 hover:-translate-y-1 hover:border-brand-300"><h2 className="text-xl font-black"><T bn={c.name_bn} en={c.name_en} /></h2><p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300"><T bn={c.description_bn} en={c.description_en} /></p></Link>)}</div></main>;
}
