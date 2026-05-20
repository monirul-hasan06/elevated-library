import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/public/checkout-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { money } from "@/lib/utils";

export default async function CheckoutPage({ searchParams }: { searchParams: { productId?: string } }) {
  const productId = searchParams.productId;
  if (!productId) redirect("/products");
  const supabase = createSupabaseServerClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", productId).eq("status", "active").single();
  if (!product) redirect("/products");
  const { data: methods } = await supabase.from("payment_methods").select("*").eq("status", "active").order("sort_order");
  const { data: { user } } = await supabase.auth.getUser();
  return <main className="container-page py-12"><div className="mb-8"><Link href={`/products/${product.slug}`} className="text-sm text-slate-500">← Back</Link><h1 className="mt-4 text-4xl font-black">Checkout</h1></div><div className="grid gap-6 lg:grid-cols-3"><aside className="card p-6"><h2 className="text-xl font-black">{product.title_bn}</h2><p className="mt-3 text-3xl font-black text-brand-700">{money(product.discount_price || product.price)}</p><p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Login checkout করলে dashboard access পাবেন, Guest checkout করলে secure link পাবেন।</p></aside><section className="card p-6 lg:col-span-2"><CheckoutForm productId={product.id} isLoggedIn={!!user} methods={methods || []} /></section></div></main>;
}
