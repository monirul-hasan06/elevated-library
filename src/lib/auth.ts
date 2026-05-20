import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .single();

  if (profile && profile.status !== "active") {
    redirect(`/account-status?status=${encodeURIComponent(profile.status)}`);
  }

  return user;
}

export async function requireStaff() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/admin");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role,status,email,display_name")
    .eq("id", user.id)
    .single();
  if (!profile || profile.status !== "active" || profile.role === "customer") {
    redirect("/dashboard");
  }
  return { user, profile };
}

export async function requireOwnerOrAdmin() {
  const ctx = await requireStaff();
  if (!["owner", "admin"].includes(ctx.profile.role)) redirect("/admin");
  return ctx;
}
