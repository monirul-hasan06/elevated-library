import { SettingsForm } from "@/components/admin/settings-form";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
export default async function Page(){const {data}=await createSupabaseAdminClient().from('site_settings').select('*').eq('id',1).single(); return <div><h1 className="text-3xl font-black">Website Settings</h1><SettingsForm settings={data}/></div>}
