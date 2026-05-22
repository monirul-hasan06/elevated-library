import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureStaffApi } from "@/lib/admin/ensure-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/utils";
import { sendVerifiedEmail } from "@/lib/email";
import { decryptToken, encryptToken, generateToken, hashToken } from "@/lib/security/token";

const schema = z.object({
  status: z.enum(["pending", "verified", "rejected", "archived", "deleted"]),
  note: z.string().optional()
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const staff = await ensureStaffApi();
  if ("error" in staff) return staff.error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { data: existingOrder, error: existingError } = await admin
    .from("orders")
    .select("*, products(title_en,title_bn)")
    .eq("id", params.id)
    .single();

  if (existingError || !existingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {
    status: parsed.data.status,
    admin_note: parsed.data.note || null
  };

  let guestDownloadUrl: string | undefined;

  if (parsed.data.status === "verified") {
    updates.verified_at = new Date().toISOString();

    if (!existingOrder.user_id) {
      const rawToken = decryptToken(existingOrder.access_token_encrypted) || generateToken();
      updates.access_token = hashToken(rawToken);
      updates.access_token_encrypted = encryptToken(rawToken);
      updates.token_expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      updates.download_uses = 0;
      guestDownloadUrl = `${getSiteUrl()}/download?token=${encodeURIComponent(rawToken)}`;
    }
  }

  if (parsed.data.status === "rejected") updates.rejected_at = new Date().toISOString();

  const { data, error } = await admin
    .from("orders")
    .update(updates)
    .eq("id", params.id)
    .select("*, products(title_en,title_bn)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await admin.from("audit_logs").insert({
    actor_id: staff.userId,
    action: `order_${parsed.data.status}`,
    target_type: "order",
    target_id: params.id
  });

  if (parsed.data.status === "verified") {
    const to = data.guest_email || null;
    if (to) {
      await sendVerifiedEmail({
        to,
        productTitle: data.products?.title_en || data.products?.title_bn || "PDF",
        downloadUrl: guestDownloadUrl
      }).catch(() => {});
    }
  }

  return NextResponse.json({ order: data });
}
