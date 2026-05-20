"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { T, useLanguageTheme } from "@/components/shared/language-theme-provider";
import type { Product } from "@/types";
import { money, pickLang } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { lang } = useLanguageTheme();
  const title = pickLang(lang, product.title_bn, product.title_en);
  return (
    <article className="group card overflow-hidden hover:-translate-y-1 hover:shadow-2xl">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-brand-50 dark:bg-slate-800">
          <Image src={product.cover_url || "/placeholder.svg"} alt={title} fill className="object-cover transition duration-500 group-hover:scale-105" />
        </div>
      </Link>
      <div className="p-5">
        <Link href={`/products/${product.slug}`}><h3 className="line-clamp-2 text-lg font-bold group-hover:text-brand-600"><T bn={product.title_bn} en={product.title_en} /></h3></Link>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300"><T bn={product.short_hook_bn} en={product.short_hook_en} /></p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            {product.discount_price ? <p className="text-xs text-slate-400 line-through">{money(product.price)}</p> : null}
            <p className="text-xl font-black text-brand-700 dark:text-brand-100">{money(product.discount_price || product.price)}</p>
          </div>
          <Link href={`/checkout?productId=${product.id}`} className="btn-primary px-4 py-2"><ShoppingBag className="mr-2 h-4 w-4" />Buy</Link>
        </div>
        <Link href={`/products/${product.slug}`} className="mt-4 inline-flex items-center text-sm font-semibold text-brand-700 dark:text-brand-100">View details <ArrowRight className="ml-1 h-4 w-4" /></Link>
      </div>
    </article>
  );
}
