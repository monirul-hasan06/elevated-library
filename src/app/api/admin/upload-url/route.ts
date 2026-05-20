import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureStaffApi } from "@/lib/admin/ensure-admin";
import { createPrivateUploadUrl } from "@/lib/storage/client";

export const runtime = "nodejs";

const schema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  prefix: z.string().optional(),
});

export async function POST(req: Request) {
  const staff = await ensureStaffApi();

  if ("error" in staff) return staff.error;

  const parsed = schema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload request" },
      { status: 400 }
    );
  }

  const data = await createPrivateUploadUrl(parsed.data);

  return NextResponse.json(data);
}