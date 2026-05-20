import { NextResponse } from "next/server";
import { ensureStaffApi } from "@/lib/admin/ensure-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const tableMap: Record<string,string> = {
  categories: "categories",
  paymentMethods: "payment_methods",
  faqs: "faqs",
  notices: "notices",
  comingSoon: "upcoming_pdfs"
};

export async function POST(req: Request, { params }: { params: { resource: string } }) {
  const staff = await ensureStaffApi(); if ("error" in staff) return staff.error;
  const table = tableMap[params.resource]; if (!table) return NextResponse.json({ error: "Invalid resource" }, { status: 404 });
  const body = await req.json();
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from(table).insert(body).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await supabase.from("audit_logs").insert({ actor_id: staff.user.id, action: `create_${params.resource}`, target_type: params.resource, target_id: data.id });
  return NextResponse.json({ data });
}
