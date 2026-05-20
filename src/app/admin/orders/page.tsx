import { OrdersManager } from "@/components/admin/orders-manager";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminOrdersPage(){ const {data}=await createSupabaseAdminClient().from('orders').select('*, products(title_bn,title_en)').neq('status','deleted').order('created_at',{ascending:false}); return <div><h1 className="text-3xl font-black">Orders Management</h1><OrdersManager orders={data||[]} /></div> }
