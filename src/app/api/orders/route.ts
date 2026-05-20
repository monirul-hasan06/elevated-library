import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { encryptToken, generateToken, hashToken } from "@/lib/security/token";
import { getSiteUrl, money } from "@/lib/utils";
import { notifyAdmin, sendOrderSubmitted } from "@/lib/email";

export const runtime = "nodejs";

const schema = z.object({
  checkoutType: z.enum(["authenticated", "guest"]),
  productId: z.string().uuid(),
  guestEmail: z.string().email().optional(),
  paymentMethodId: z.string().uuid(),
  trxId: z.string().trim().min(4).max(80),
  senderPhone: z.string().trim().regex(/^(\+?88)?01[3-9]\d{8}$/, "Invalid Bangladeshi phone number")
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const input = parsed.data;
    const admin = createSupabaseAdminClient();
    const server = createSupabaseServerClient();

    let userId: string | null = null;
    let email: string | null = input.guestEmail?.toLowerCase() || null;

    if (input.checkoutType === "authenticated") {
      const { data: { user } } = await server.auth.getUser();
      if (!user) return NextResponse.json({ error: "Please login first" }, { status: 401 });

      const { data: profile } = await admin.from("profiles").select("status").eq("id", user.id).single();
      if (profile && profile.status !== "active") {
        return NextResponse.json({ error: `Your account is ${profile.status}. Please contact support.` }, { status: 403 });
      }

      userId = user.id;
      email = user.email || null;
    } else if (!email) {
      return NextResponse.json({ error: "Guest email required" }, { status: 400 });
    }

    const [{ data: product }, { data: method }] = await Promise.all([
      admin.from("products").select("*").eq("id", input.productId).eq("status", "active").single(),
      admin.from("payment_methods").select("*").eq("id", input.paymentMethodId).eq("status", "active").single()
    ]);

    if (!product) return NextResponse.json({ error: "Product unavailable" }, { status: 404 });
    if (!method) return NextResponse.json({ error: "Payment method unavailable" }, { status: 404 });

    const rawToken = input.checkoutType === "guest" ? generateToken() : null;
    const downloadUrl = rawToken ? `${getSiteUrl()}/download?token=${encodeURIComponent(rawToken)}` : undefined;

    const amount = Number(product.discount_price || product.price || 0);

    const { data: order, error } = await admin.from("orders").insert({
      user_id: userId,
      product_id: product.id,
      payment_method_id: method.id,
      amount,
      payment_method: method.method,
      trx_id: input.trxId.trim().toUpperCase(),
      sender_phone: input.senderPhone.trim(),
      guest_email: input.checkoutType === "guest" ? email : null,
      access_token: rawToken ? hashToken(rawToken) : null,
      access_token_encrypted: rawToken ? encryptToken(rawToken) : null,
      token_expires_at: rawToken ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() : null,
      status: "pending"
    }).select("*").single();

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "This TrxID already submitted" }, { status: 409 });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await Promise.allSettled([
      email ? sendOrderSubmitted({
        to: email,
        orderId: order.id,
        productTitle: product.title_en || product.title_bn,
        amount: money(order.amount),
        downloadUrl
      }) : null,
      notifyAdmin({
        subject: "New Elevated Library order",
        html: `<p>New pending order: ${order.id}</p><p>Product: ${product.title_en || product.title_bn}</p><p>TrxID: ${order.trx_id}</p>`
      })
    ]);

    return NextResponse.json({ success: true, orderId: order.id, downloadUrl: downloadUrl || null }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
