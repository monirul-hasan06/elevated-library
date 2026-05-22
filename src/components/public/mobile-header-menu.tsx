"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LanguageThemeControls } from "@/components/public/language-theme-controls";
import { PwaInstallButton } from "@/components/public/pwa-install-button";

type NavLink = {
  href: string;
  label: string;
};

export function MobileHeaderMenu({
  siteName,
  navLinks,
  isGuestMode,
  isLoggedIn,
  isStaff,
  pwaInstallEnabled,
}: {
  siteName: string;
  navLinks: NavLink[];
  isGuestMode: boolean;
  isLoggedIn: boolean;
  isStaff: boolean;
  pwaInstallEnabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-slate-200 p-2 dark:border-slate-800"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/60">
          <div className="ml-auto h-full w-[86%] max-w-sm overflow-y-auto bg-white p-5 shadow-xl dark:bg-slate-950">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="min-w-0 flex-1 truncate font-black text-brand-700 dark:text-brand-100"
              >
                {siteName}
              </Link>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 p-2 dark:border-slate-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <LanguageThemeControls />
              <PwaInstallButton enabled={pwaInstallEnabled} />
            </div>

            <nav className="mt-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {link.label}
                </Link>
              ))}

              {isStaff ? (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-950"
                >
                  Admin
                </Link>
              ) : null}

              {!isGuestMode ? (
                isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl px-4 py-3 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Dashboard
                    </Link>

                    <Link
                      href="/logout"
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      Logout
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl bg-brand-600 px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    Login
                  </Link>
                )
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl border border-brand-200 px-4 py-3 text-center text-sm font-bold text-brand-700 dark:border-brand-800 dark:text-brand-200"
                >
                  Admin Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
