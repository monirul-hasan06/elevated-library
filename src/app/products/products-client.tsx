"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/public/product-card";
import type { Category, Product } from "@/types";
import { T, useLanguageTheme } from "@/components/shared/language-theme-provider";
import { pickLang } from "@/lib/utils";

export function ProductsClient({ products, categories }: { products: Product[]; categories: Category[] }) {
  const { lang } = useLanguageTheme();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let list = [...products];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p => `${p.title_bn} ${p.title_en} ${p.short_hook_bn || ""} ${p.short_hook_en || ""}`.toLowerCase().includes(q));
    }
    if (category !== "all") list = list.filter((p: any) => (p.product_categories || []).some((pc: any) => pc.categories?.slug === category));
    if (sort === "price_low") list.sort((a,b) => Number(a.discount_price || a.price) - Number(b.discount_price || b.price));
    if (sort === "price_high") list.sort((a,b) => Number(b.discount_price || b.price) - Number(a.discount_price || a.price));
    if (sort === "popular") list.sort((a,b) => Number(b.popular_score || 0) - Number(a.popular_score || 0));
    return list;
  }, [products, query, category, sort]);

  return (
    <main className="container-page py-12">
      <div className="mb-8"><h1 className="text-4xl font-black">PDF Library</h1><p className="mt-3 text-slate-600 dark:text-slate-300">Search, filter, sort করে আপনার দরকারি PDF খুঁজুন।</p></div>
      <div className="card mb-8 grid gap-3 p-4 md:grid-cols-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search PDF..." className="input" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input"><option value="all">All Categories</option>{categories.map(c => <option key={c.id} value={c.slug}>{pickLang(lang, c.name_bn, c.name_en)}</option>)}</select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input"><option value="newest">Newest</option><option value="popular">Popular</option><option value="price_low">Price: Low to High</option><option value="price_high">Price: High to Low</option></select>
      </div>
      {filtered.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{filtered.map((p) => <ProductCard key={p.id} product={p} />)}</div> : <div className="card p-8 text-center">No PDF found.</div>}
    </main>
  );
}
