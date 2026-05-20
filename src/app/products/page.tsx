import { ProductsClient } from "./products-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function ProductsPage() {
  const supabase = createSupabaseServerClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*, product_categories(categories(slug,name_bn,name_en))").eq("status", "active").order("created_at", { ascending: false }),
    supabase.from("categories").select("*").eq("status", "active").order("sort_order")
  ]);
  return <ProductsClient products={(products || []) as any} categories={(categories || []) as any} />;
}
