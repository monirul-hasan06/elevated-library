import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const profileSchema = z.object({
  full_name: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  bio: z.string().trim().max(500).optional().nullable(),
  avatar_url: z.string().trim().url().optional().or(z.literal("")).nullable(),
});

export async function GET() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, email, role, status, full_name, phone, bio, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json(
      { error: error?.message || "Profile not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid profile data" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  const { data: profile, error } = await admin
    .from("profiles")
    .update({
      full_name: parsed.data.full_name || null,
      phone: parsed.data.phone || null,
      bio: parsed.data.bio || null,
      avatar_url: parsed.data.avatar_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("id, email, role, status, full_name, phone, bio, avatar_url, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: "profile_updated",
    target_type: "profile",
    target_id: user.id,
    metadata: {
      email: user.email,
    },
  });

  return NextResponse.json({ profile });
}