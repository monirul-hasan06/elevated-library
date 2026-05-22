import Link from "next/link";
import { LanguageThemeControls } from "@/components/public/language-theme-controls";
import { PwaInstallButton } from "@/components/public/pwa-install-button";
import { MobileHeaderMenu } from "@/components/public/mobile-header-menu";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  const isStaff = Boolean(profile?.role && profile.role !== "customer");

  const navLinks = [
    { href: "/products", label: "PDFs" },
    { href: "/categories", label: "Categories" },
    { href: "/coming-soon", label: "Coming Soon" },
    { href: "/how-it-works", label: "How it Works" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="container-page flex min-h-16 items-center justify-between gap-3 py-2">
        <Link
          href="/"
          className="min-w-0 text-base font-black tracking-tight text-brand-700 dark:text-brand-100 sm:text-lg"
        >
          <span className="block truncate">{siteName}</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand-600">
              {link.label}
            </Link>
          ))}

          {isStaff ? (
            <Link href="/admin" className="hover:text-brand-600">
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden sm:block">
            <LanguageThemeControls />
          </div>

          <div className="hidden md:block">
            <PwaInstallButton enabled={pwaInstallEnabled} />
          </div>

          {!isGuestMode ? (
            user ? (
              <>
                <Link href="/dashboard" className="btn-secondary hidden xl:inline-flex">
                  Dashboard
                </Link>

                <Link
                  href="/logout"
                  className="hidden rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950 xl:inline-flex"
                >
                  Logout
                </Link>
              </>
            ) : (
              <Link href="/login" className="btn-primary hidden xl:inline-flex">
                Login
              </Link>
            )
          ) : null}

          <MobileHeaderMenu
            siteName={siteName}
            navLinks={navLinks}
            isGuestMode={isGuestMode}
            isLoggedIn={Boolean(user)}
            isStaff={isStaff}
            pwaInstallEnabled={pwaInstallEnabled}
          />
        </div>
      </div>
    </header>
  );
}
