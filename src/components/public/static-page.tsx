import { notFound } from "next/navigation";
import { T } from "@/components/shared/language-theme-provider";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function StaticPage({ slug }: { slug: string }) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("static_pages").select("*").eq("slug", slug).eq("status", "active").single();
  if (!data) notFound();
  return <main className="container-page py-12"><article className="card max-w-4xl p-8"><h1 className="text-4xl font-black"><T bn={data.title_bn} en={data.title_en} /></h1><div className="prose prose-slate mt-6 max-w-none whitespace-pre-line dark:prose-invert"><T bn={data.body_bn} en={data.body_en} /></div></article></main>;
}
