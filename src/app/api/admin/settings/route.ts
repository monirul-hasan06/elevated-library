import { NextResponse } from "next/server";
import { ensureStaffApi } from "@/lib/admin/ensure-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: Request) {
  const staff = await ensureStaffApi(); if ("error" in staff) return staff.error;
  const body = await req.json();
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("site_settings").update(body).eq("id", 1).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await supabase.from("audit_logs").insert({ actor_id: staff.user.id, action: "update_site_settings", target_type: "site_settings", target_id: "1" });
  return NextResponse.json({ data });
}
