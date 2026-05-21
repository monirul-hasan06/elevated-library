import Link from "next/link";
import { LanguageThemeControls } from "@/components/public/language-theme-controls";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PwaInstallButton } from "@/components/public/pwa-install-button";

export async function Header({
  siteName = "Elevated Library",
  siteMode = "normal",
  pwaInstallEnabled = true,
}: {
  siteName?: string;
  siteMode?: "normal" | "guest";
  pwaInstallEnabled?: boolean;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
    : ({ data: null } as any);

  const isGuestMode = siteMode === "guest";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="text-lg font-black tracking-tight text-brand-700 dark:text-brand-100"
        >
          {siteName}
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          <Link href="/products" className="hover:text-brand-600">
            PDFs
          </Link>

          <Link href="/categories" className="hover:text-brand-600">
            Categories
          </Link>

          <Link href="/coming-soon" className="hover:text-brand-600">
            Coming Soon
          </Link>

          <Link href="/how-it-works" className="hover:text-brand-600">
            How it Works
          </Link>

          <Link href="/faq" className="hover:text-brand-600">
            FAQ
          </Link>

          {profile?.role && profile.role !== "customer" ? (
  <Link href="/admin" className="hover:text-brand-600">
    Admin
  </Link>
) : null}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageThemeControls />
          <PwaInstallButton enabled={pwaInstallEnabled} />

          {!isGuestMode ? (
            user ? (
              <>
                <Link
                  href="/dashboard"
                  className="btn-secondary hidden sm:inline-flex"
                >
                  Dashboard
                </Link>

                <Link
                  href="/logout"
                  className="hidden rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950 sm:inline-flex"
                >
                  Logout
                </Link>
              </>
            ) : (
              <Link href="/login" className="btn-primary hidden sm:inline-flex">
                Login
              </Link>
            )
          ) : null}
        </div>
      </div>
    </header>
  );
}