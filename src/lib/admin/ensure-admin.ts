import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type StaffRole =
  | "owner"
  | "admin"
  | "super_admin"
  | "order_manager"
  | "product_manager"
  | "payment_manager"
  | "support_agent"
  | "marketing_manager";

const STAFF_ROLES: StaffRole[] = [
  "owner",
  "admin",
  "super_admin",
  "order_manager",
  "product_manager",
  "payment_manager",
  "support_agent",
  "marketing_manager",
];

async function getUserIdFromBearerToken() {
  const headerStore = headers();
  const authHeader = headerStore.get("authorization");

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) return null;

  const admin = createSupabaseAdminClient();

  const {
    data: { user },
    error,
  } = await admin.auth.getUser(token);

  if (error || !user) return null;

  return user.id;
}

async function getUserIdFromCookieSession() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return user.id;
}

export async function ensureStaffApi() {
  const admin = createSupabaseAdminClient();

  const userId =
    (await getUserIdFromBearerToken()) || (await getUserIdFromCookieSession());

  if (!userId) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, email, role, status")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return {
      error: NextResponse.json({ error: "Profile not found" }, { status: 403 }),
    };
  }

  if (profile.status !== "active" || !STAFF_ROLES.includes(profile.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    userId,
    profile,
  };
}