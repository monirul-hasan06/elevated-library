import Link from "next/link";
import { T } from "@/components/shared/language-theme-provider";

export function Footer({ settings }: { settings?: any }) {
  const siteMode = settings?.site_mode || "normal";
  const isGuestMode = siteMode === "guest";

  return (
    <footer className="mt-20 border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-950">
      <div className="container-page grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link
            href="/"
            className="text-xl font-black text-brand-700 dark:text-brand-100"
          >
            {settings?.site_name || "Elevated Library"}
          </Link>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            <T
              bn={
                settings?.footer_description_bn ||
                "Elevated Library — Bangla-English self-growth PDF library."
              }
              en={
                settings?.footer_description_en ||
                "Elevated Library — Bangla-English self-growth PDF library."
              }
            />
          </p>

          {settings?.facebook_url ? (
            <Link
              href={settings.facebook_url}
              target="_blank"
              className="mt-4 inline-flex text-sm font-bold text-brand-700 hover:underline dark:text-brand-200"
            >
              Facebook Page
            </Link>
          ) : null}
        </div>

        <div>
          <h3 className="font-black">Quick Links</h3>

          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <Link className="block hover:text-brand-600" href="/products">
              PDFs
            </Link>

            <Link className="block hover:text-brand-600" href="/categories">
              Categories
            </Link>

            <Link className="block hover:text-brand-600" href="/coming-soon">
              Coming Soon
            </Link>

            <Link className="block hover:text-brand-600" href="/how-it-works">
              How it Works
            </Link>

            <Link className="block hover:text-brand-600" href="/faq">
              FAQ
            </Link>

            {!isGuestMode ? (
              <>
                <Link className="block hover:text-brand-600" href="/login">
                  Login
                </Link>

                <Link className="block hover:text-brand-600" href="/register">
                  Register
                </Link>

                <Link className="block hover:text-brand-600" href="/dashboard">
                  Dashboard
                </Link>
              </>
            ) : null}

            <Link
              className="block font-bold text-brand-700 hover:underline dark:text-brand-200"
              href="/login"
            >
              Admin Login
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-black">Support</h3>

          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>{settings?.owner_email || "dev.get.in.touch@gmail.com"}</p>

            {settings?.messenger_url ? (
              <Link
                href={settings.messenger_url}
                target="_blank"
                className="block hover:text-brand-600"
              >
                Message on Facebook
              </Link>
            ) : settings?.facebook_url ? (
              <Link
                href={settings.facebook_url}
                target="_blank"
                className="block hover:text-brand-600"
              >
                Knock us on Facebook
              </Link>
            ) : null}

            <Link className="block hover:text-brand-600" href="/terms">
              Terms
            </Link>

            <Link className="block hover:text-brand-600" href="/privacy">
              Privacy
            </Link>

            <Link className="block hover:text-brand-600" href="/refund-policy">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>

      <div className="container-page mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800">
        © {new Date().getFullYear()} Elevated Library. All rights reserved.
      </div>
    </footer>
  );
}