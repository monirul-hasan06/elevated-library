import { notFound } from "next/navigation";
import { ProductCard } from "@/components/public/product-card";
import { T } from "@/components/shared/language-theme-provider";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: category } = await supabase.from("categories").select("*").eq("slug", params.slug).eq("status", "active").single();
  if (!category) notFound();
  const { data } = await supabase.from("product_categories").select("products(*)").eq("category_id", category.id);
  const products = (data || []).map((row: any) => row.products).filter(Boolean).filter((p: any) => p.status === "active");
  return <main className="container-page py-12"><h1 className="text-4xl font-black"><T bn={category.name_bn} en={category.name_en} /></h1><p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300"><T bn={category.description_bn} en={category.description_en} /></p><div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((p: any) => <ProductCard key={p.id} product={p} />)}</div>{!products.length ? <div className="card mt-8 p-8 text-center">No PDFs in this category yet.</div> : null}</main>;
}
