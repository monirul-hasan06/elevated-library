import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/public/product-card";
import { T } from "@/components/shared/language-theme-provider";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { money } from "@/lib/utils";

export const revalidate = 60;

export default async function ProductDetailsPage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: product } = await supabase.from("products").select("*, product_categories(categories(*))").eq("slug", params.slug).eq("status", "active").single();
  if (!product) notFound();
  const { data: related } = await supabase.from("products").select("*").eq("status", "active").neq("id", product.id).limit(4);
  return (
    <main className="container-page py-12">
      <div className="grid gap-10 lg:grid-cols-[420px,1fr]">
        <div className="card overflow-hidden"><div className="relative aspect-[4/5]"><Image src={product.cover_url || "/placeholder.svg"} alt={product.title_en} fill className="object-cover" /></div></div>
        <div>
          <div className="flex flex-wrap gap-2">{(product.product_categories || []).map((pc: any) => <span key={pc.categories?.id} className="badge bg-brand-100 text-brand-700">{pc.categories?.name_bn}</span>)}</div>
          <h1 className="mt-5 text-4xl font-black tracking-tight"><T bn={product.title_bn} en={product.title_en} /></h1>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300"><T bn={product.short_hook_bn} en={product.short_hook_en} /></p>
          <div className="mt-6 flex items-center gap-4"><p className="text-3xl font-black text-brand-700 dark:text-brand-100">{money(product.discount_price || product.price)}</p>{product.discount_price ? <p className="text-lg text-slate-400 line-through">{money(product.price)}</p> : null}</div>
          <div className="mt-7 flex flex-wrap gap-3"><Link href={`/checkout?productId=${product.id}`} className="btn-primary">Buy Now</Link><Link href="/how-it-works" className="btn-secondary">How to Buy</Link></div>
          <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">এই PDF personal use-এর জন্য। Verified buyer-এর PDF-তে unique watermark থাকতে পারে।</div>
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <Info title="What You Will Learn" bn={product.what_you_learn_bn} en={product.what_you_learn_en} />
        <Info title="Who This Is For" bn={product.who_is_for_bn} en={product.who_is_for_en} />
        <Info title="Inside This PDF" bn={product.inside_pdf_bn} en={product.inside_pdf_en} />
      </div>
      <section className="mt-10 card p-6"><h2 className="text-2xl font-black">Description</h2><p className="mt-4 whitespace-pre-line leading-8 text-slate-600 dark:text-slate-300"><T bn={product.description_bn} en={product.description_en} /></p></section>
      {product.preview_text_bn || product.preview_text_en ? <section className="mt-10 card p-6"><h2 className="text-2xl font-black">Free Preview</h2><p className="mt-4 whitespace-pre-line leading-8 text-slate-600 dark:text-slate-300"><T bn={product.preview_text_bn} en={product.preview_text_en} /></p></section> : null}
      <section className="mt-14"><h2 className="text-3xl font-black">Related PDFs</h2><div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{(related || []).map((p: any) => <ProductCard key={p.id} product={p} />)}</div></section>
    </main>
  );
}

function Info({ title, bn, en }: { title: string; bn?: string | null; en?: string | null }) {
  return <section className="card p-6"><h2 className="text-xl font-black">{title}</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300"><T bn={bn} en={en} /></p></section>;
}
