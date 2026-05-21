import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const profileSchema = z.object({
  full_name: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  bio: z.string().trim().max(500).optional().nullable(),
  avatar_url: z.string().trim().url().optional().or(z.literal("")).nullable(),
});

async function getCurrentUserId(request: Request) {
  const admin = createSupabaseAdminClient();

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (bearerToken) {
    const {
      data: { user },
      error,
    } = await admin.auth.getUser(bearerToken);

    if (!error && user) {
      return user.id;
    }
  }

  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!error && user) {
    return user.id;
  }

  return null;
}

export async function GET(request: Request) {
  const userId = await getCurrentUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  const { data: profile, error } = await admin
    .from("profiles")
    .select(
      "id, email, role, status, full_name, phone, bio, avatar_url, created_at, updated_at"
    )
    .eq("id", userId)
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
  const userId = await getCurrentUserId(request);

  if (!userId) {
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
    .eq("id", userId)
    .select(
      "id, email, role, status, full_name, phone, bio, avatar_url, created_at, updated_at"
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await admin.from("audit_logs").insert({
    actor_id: userId,
    action: "profile_updated",
    target_type: "profile",
    target_id: userId,
    metadata: {},
  });

  return NextResponse.json({ profile });
}