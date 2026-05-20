import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createPrivateDownloadUrl } from "@/lib/storage/client";
import { hashToken } from "@/lib/security/token";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const orderId = url.searchParams.get("orderId");
    const admin = createSupabaseAdminClient();
    const server = createSupabaseServerClient();

    let query = admin.from("orders").select("*, products(*)");
    if (token) query = query.eq("access_token", hashToken(token));
    else if (orderId) query = query.eq("id", orderId);
    else return NextResponse.json({ error: "Missing token/orderId" }, { status: 400 });

    const { data: order } = await query.single();
    if (!order) return NextResponse.json({ error: "Download link not found" }, { status: 404 });
    if (order.status !== "verified") return NextResponse.json({ error: "Order is not verified yet" }, { status: 403 });
    if (order.token_expires_at && new Date(order.token_expires_at).getTime() < Date.now()) return NextResponse.json({ error: "Download token expired" }, { status: 403 });
    if (token && order.download_uses >= 3) return NextResponse.json({ error: "Guest download limit reached" }, { status: 403 });

    if (orderId) {
      const { data: { user } } = await server.auth.getUser();
      if (!user || user.id !== order.user_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const { data: profile } = await admin.from("profiles").select("status").eq("id", user.id).single();
      if (profile && profile.status !== "active") return NextResponse.json({ error: `Your account is ${profile.status}. Please contact support.` }, { status: 403 });
    }

    if (!order.products?.file_key) return NextResponse.json({ error: "PDF file not configured" }, { status: 400 });

    const signedUrl = await createPrivateDownloadUrl(order.products.file_key, 300);
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const ua = req.headers.get("user-agent");

    await Promise.allSettled([
      admin.from("orders").update({ download_uses: (order.download_uses || 0) + 1 }).eq("id", order.id),
      admin.from("download_logs").insert({ order_id: order.id, user_id: order.user_id, product_id: order.product_id, ip, user_agent: ua })
    ]);

    return NextResponse.redirect(signedUrl);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
