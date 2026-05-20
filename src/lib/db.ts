import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getSiteSettings() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  return data;
}

export async function getActiveNotices(position?: string) {
  const supabase = createSupabaseServerClient();
  let q = supabase.from("notices").select("*").eq("status", "active").order("created_at", { ascending: false });
  if (position) q = q.eq("position", position);
  const { data } = await q;
  return data || [];
}
