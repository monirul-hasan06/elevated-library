import { NextResponse } from "next/server";
import { ensureStaffApi } from "@/lib/admin/ensure-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request){
 const staff=await ensureStaffApi(); if('error' in staff) return staff.error;
 const body=await req.json(); const supabase=createSupabaseAdminClient();
 const {category_ids=[],...product}=body;
 if(!product.title_bn || !product.title_en || !product.slug) return NextResponse.json({error:'Title and slug required'}, {status:400});
 product.discount_price = product.discount_price === "" ? null : product.discount_price;
 const {data,error}=await supabase.from('products').insert(product).select('*').single();
 if(error) return NextResponse.json({error:error.message}, {status:400});
 if(category_ids.length) await supabase.from('product_categories').insert(category_ids.map((category_id:string)=>({product_id:data.id,category_id})));
 await supabase.from('audit_logs').insert({actor_id: staff.userId, action:'create_product', target_type:'product', target_id:data.id});
 return NextResponse.json({product:data});
}
