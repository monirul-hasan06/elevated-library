import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_SETTING_KEYS = [
  "site_name",
  "owner_email",
  "facebook_url",
  "messenger_url",
  "logo_url",
  "favicon_url",
  "primary_color",
  "default_language",
  "default_theme",
  "site_mode",
  "pwa_install_enabled",
  "welcome_notice_enabled",
  "welcome_notice_bn",
  "welcome_notice_en",
  "hero_title_bn",
  "hero_title_en",
  "hero_subtitle_bn",
  "hero_subtitle_en",
  "hero_button_bn",
  "hero_button_en",
  "footer_description_bn",
  "footer_description_en",
  "support_text_bn",
  "support_text_en",
];

async function getCurrentAdmin(request: Request) {
  const admin = createSupabaseAdminClient();

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  let userId: string | null = null;

  if (bearerToken) {
    const {
      data: { user },
      error,
    } = await admin.auth.getUser(bearerToken);

    if (!error && user) {
      userId = user.id;
    }
  }

  if (!userId) {
    const supabase = createSupabaseServerClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user) {
      userId = user.id;
    }
  }

  if (!userId) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, email, role, status")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return { error: "Profile not found", status: 403 as const };
  }

  const allowedRoles = ["owner", "admin", "super_admin", "marketing_manager"];

  if (profile.status !== "active" || !allowedRoles.includes(profile.role)) {
    return { error: "Forbidden", status: 403 as const };
  }

  return { userId, profile };
}

export async function PATCH(request: Request) {
  const auth = await getCurrentAdmin(request);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const cleanPayload: Record<string, any> = {};

  for (const key of ALLOWED_SETTING_KEYS) {
    if (key in body) cleanPayload[key] = body[key];
  }

  if (
    cleanPayload.site_mode &&
    !["normal", "guest"].includes(cleanPayload.site_mode)
  ) {
    return NextResponse.json({ error: "Invalid site mode" }, { status: 400 });
  }

  cleanPayload.updated_at = new Date().toISOString();

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("site_settings")
    .update(cleanPayload)
    .eq("id", 1)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await admin.from("audit_logs").insert({
    actor_id: auth.userId,
    action: "site_settings_updated",
    target_type: "site_settings",
    target_id: "1",
    metadata: {
      updated_keys: Object.keys(cleanPayload),
      site_mode: cleanPayload.site_mode,
    },
  });

  return NextResponse.json({ success: true, settings: data });
}
