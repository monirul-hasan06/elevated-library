import { ProductForm } from "@/components/admin/product-form";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
export default async function NewProductPage(){ const {data:categories}=await createSupabaseAdminClient().from('categories').select('*').neq('status','deleted').order('sort_order'); return <div><h1 className="text-3xl font-black">Add Product</h1><ProductForm categories={categories||[]} /></div> }
