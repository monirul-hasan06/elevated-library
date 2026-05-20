import { FAQAccordion } from "@/components/public/faq-accordion";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function FAQPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("faqs").select("*").eq("status", "active").order("sort_order");
  return <main className="container-page py-12"><h1 className="text-4xl font-black">Frequently Asked Questions</h1><p className="mt-3 text-slate-600 dark:text-slate-300">Payment, download, account, PDF usage—সব common question.</p><div className="mt-8 max-w-4xl"><FAQAccordion faqs={data || []} /></div></main>;
}
