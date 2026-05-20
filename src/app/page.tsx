import { HomeClient } from "@/components/public/home-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/db";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const settings = await getSiteSettings();
  const [{ data: products }, { data: categories }, { data: faqs }, { data: upcoming }] = await Promise.all([
    supabase.from("products").select("*").eq("status", "active").eq("featured", true).order("created_at", { ascending: false }).limit(8),
    supabase.from("categories").select("*").eq("status", "active").order("sort_order", { ascending: true }).limit(8),
    supabase.from("faqs").select("*").eq("status", "active").eq("show_on_home", true).order("sort_order", { ascending: true }).limit(6),
    supabase.from("upcoming_pdfs").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(3)
  ]);
  return <HomeClient settings={settings as any} products={(products || []) as any} categories={(categories || []) as any} faqs={faqs || []} upcoming={upcoming || []} />;
}
