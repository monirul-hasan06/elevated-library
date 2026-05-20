"use client";

import Link from "next/link";
import { ArrowRight, Bell, CheckCircle2, CreditCard, Download, ShieldCheck } from "lucide-react";
import { T } from "@/components/shared/language-theme-provider";
import { ProductCard } from "@/components/public/product-card";
import { FAQAccordion } from "@/components/public/faq-accordion";
import type { Category, Product, SiteSettings } from "@/types";

export function HomeClient({ settings, products, categories, faqs, upcoming }: { settings: SiteSettings; products: Product[]; categories: Category[]; faqs: any[]; upcoming: any[] }) {
  const steps = [
    { icon: CheckCircle2, bn: "PDF choose করুন", en: "Choose PDF" },
    { icon: CreditCard, bn: "bKash/Nagad payment", en: "Pay manually" },
    { icon: ShieldCheck, bn: "Admin verify করবে", en: "Admin verifies" },
    { icon: Download, bn: "Secure download", en: "Secure download" }
  ];
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-slate-100 py-20 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="badge bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-100">Elevated Library</p>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"><T bn={settings.hero_title_bn} en={settings.hero_title_en} /></h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300"><T bn={settings.hero_subtitle_bn} en={settings.hero_subtitle_en} /></p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/products" className="btn-primary"><T bn={settings.hero_button_bn} en={settings.hero_button_en} /> <ArrowRight className="ml-2 h-4 w-4" /></Link><Link href="/how-it-works" className="btn-secondary">How it Works</Link></div>
          </div>
          <div className="card p-6 lg:p-8">
            <div className="rounded-3xl bg-slate-950 p-6 text-white dark:bg-white dark:text-slate-950">
              <p className="text-sm opacity-70">Premium PDF Library</p>
              <h2 className="mt-3 text-3xl font-black">Mindset • Confidence • Discipline</h2>
              <p className="mt-4 text-sm opacity-75">Bangla-English practical guides for personal growth.</p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/10 p-4 dark:bg-slate-950/10">Secure Download</div>
                <div className="rounded-2xl bg-white/10 p-4 dark:bg-slate-950/10">Manual Payment</div>
                <div className="rounded-2xl bg-white/10 p-4 dark:bg-slate-950/10">Watermark Ready</div>
                <div className="rounded-2xl bg-white/10 p-4 dark:bg-slate-950/10">Notify Me</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16"><div className="mb-8 flex items-end justify-between"><div><h2 className="text-3xl font-black">Featured PDFs</h2><p className="mt-2 text-slate-600 dark:text-slate-300">Hook-based detail page সহ premium PDFs.</p></div><Link href="/products" className="text-sm font-bold text-brand-700">View all</Link></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>

      <section className="container-page py-8"><h2 className="text-3xl font-black">Explore by Category</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{categories.map((c) => <Link key={c.id} href={`/categories/${c.slug}`} className="card p-5 hover:-translate-y-1 hover:border-brand-300"><h3 className="font-bold"><T bn={c.name_bn} en={c.name_en} /></h3><p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300"><T bn={c.description_bn} en={c.description_en} /></p></Link>)}</div></section>

      <section className="container-page py-16"><h2 className="text-3xl font-black">How It Works</h2><div className="mt-6 grid gap-4 md:grid-cols-4">{steps.map((s, i) => <div key={s.en} className="card p-5"><s.icon className="h-7 w-7 text-brand-600" /><p className="mt-4 text-sm font-bold">Step {i + 1}</p><h3 className="mt-1 text-lg font-black"><T bn={s.bn} en={s.en} /></h3></div>)}</div></section>

      <section className="container-page py-8"><div className="mb-8 flex items-center justify-between"><div><h2 className="text-3xl font-black">Coming Soon</h2><p className="mt-2 text-slate-600 dark:text-slate-300">Specific PDF-এর জন্য Notify Me on করতে পারবেন।</p></div><Link href="/coming-soon" className="text-sm font-bold text-brand-700">See all</Link></div><div className="grid gap-4 md:grid-cols-3">{upcoming.map((u) => <Link key={u.id} href="/coming-soon" className="card p-5 hover:-translate-y-1"><p className="badge bg-amber-100 text-amber-700">Coming Soon</p><h3 className="mt-4 text-xl font-black"><T bn={u.title_bn} en={u.title_en} /></h3><p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300"><T bn={u.description_bn} en={u.description_en} /></p><p className="mt-4 inline-flex items-center text-sm font-semibold text-brand-700"><Bell className="mr-2 h-4 w-4" /> Notify Me</p></Link>)}</div></section>

      <section className="container-page py-16"><h2 className="text-3xl font-black">Frequently Asked Questions</h2><div className="mt-6 max-w-3xl"><FAQAccordion faqs={faqs} /></div></section>
    </>
  );
}
