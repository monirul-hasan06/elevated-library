import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminUtilityPage({ params }: any) {
  return <div><h1 className="text-3xl font-black">Admin Module</h1><div className="card mt-6 p-6"><p>This module is included in the structure and database. Extend this page when your business needs this part fully automated.</p><p className="mt-2 text-sm text-slate-500">For now, core selling, products, orders, categories, payment methods, FAQ, notices, settings, coming soon and secure download are ready.</p></div></div>;
}
