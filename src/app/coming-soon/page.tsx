import { ComingSoonClient } from "./coming-soon-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function ComingSoonPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("upcoming_pdfs").select("*, categories(name_bn,name_en,slug)").eq("status", "active").order("created_at", { ascending: false });
  return <ComingSoonClient items={data || []} />;
}
