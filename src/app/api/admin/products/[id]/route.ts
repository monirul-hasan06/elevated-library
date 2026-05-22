import { NextResponse } from "next/server";
import { ensureStaffApi } from "@/lib/admin/ensure-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: Request,{params}:{params:{id:string}}){
 const staff=await ensureStaffApi(); if('error' in staff) return staff.error;
 const body=await req.json(); const supabase=createSupabaseAdminClient();
 const {category_ids=[],...product}=body; product.discount_price = product.discount_price === "" ? null : product.discount_price;
 const {data,error}=await supabase.from('products').update(product).eq('id',params.id).select('*').single();
 if(error) return NextResponse.json({error:error.message}, {status:400});
 await supabase.from('product_categories').delete().eq('product_id',params.id);
 if(category_ids.length) await supabase.from('product_categories').insert(category_ids.map((category_id:string)=>({product_id:params.id,category_id})));
 await supabase.from('audit_logs').insert({actor_id: staff.userId, action:'update_product', target_type:'product', target_id:params.id});
 return NextResponse.json({product:data});
}
export async function DELETE(_req: Request,{params}:{params:{id:string}}){
 const staff=await ensureStaffApi(); if('error' in staff) return staff.error;
 const supabase=createSupabaseAdminClient(); const {error}=await supabase.from('products').update({status:'deleted',deleted_at:new Date().toISOString()}).eq('id',params.id);
 if(error) return NextResponse.json({error:error.message},{status:400});
 await supabase.from('audit_logs').insert({actor_id: staff.userId, action:'delete_product', target_type:'product', target_id:params.id});
 return NextResponse.json({success:true});
}
