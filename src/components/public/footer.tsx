import Link from "next/link";
import type { SiteSettings } from "@/types";

export function Footer({ settings }: { settings?: SiteSettings | null }) {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
      <div className="container-page grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <h2 className="text-xl font-black text-brand-700 dark:text-brand-100">{settings?.site_name || "Elevated Library"}</h2>
          <p className="mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-300">{settings?.footer_description_bn || "Bangladeshi learners-এর জন্য practical self-growth PDF library."}</p>
          <p className="mt-2 text-sm text-slate-500">Email: {settings?.owner_email || "dev.get.in.touch@gmail.com"}</p>
        </div>
        <div>
          <h3 className="font-semibold">Quick Links</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Link href="/products">Products</Link><Link href="/how-it-works">How It Works</Link><Link href="/faq">FAQ</Link><Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Legal</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/refund-policy">Refund Policy</Link>
            <a href={settings?.facebook_url || "https://www.facebook.com/ElevatedLibrary"} target="_blank" rel="noreferrer">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
