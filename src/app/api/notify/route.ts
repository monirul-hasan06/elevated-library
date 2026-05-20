import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema=z.object({upcomingPdfId:z.string().uuid(), guestEmail:z.string().email().optional(), guestPhone:z.string().optional()});
export async function POST(req:Request){
 const parsed=schema.safeParse(await req.json().catch(()=>null)); if(!parsed.success) return NextResponse.json({error:'Valid email required'}, {status:400});
 const input=parsed.data; const server=createSupabaseServerClient(); const admin=createSupabaseAdminClient();
 const {data:{user}}=await server.auth.getUser(); const email=user?.email || input.guestEmail;
 if(!email) return NextResponse.json({error:'Email required'}, {status:400});
 const {error}=await admin.from('notify_subscribers').upsert({upcoming_pdf_id:input.upcomingPdfId,user_id:user?.id||null,guest_email:user?null:email.toLowerCase(),guest_phone:input.guestPhone||null,status:'active'},{onConflict:user?'upcoming_pdf_id,user_id':'upcoming_pdf_id,guest_email'} as any);
 if(error) return NextResponse.json({error:error.message}, {status:400});
 return NextResponse.json({success:true});
}
