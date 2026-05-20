import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { randomKey } from "@/lib/security/token";
import {
  createDownloadUrl as createR2DownloadUrl,
  createUploadUrl as createR2UploadUrl,
} from "@/lib/r2/client";

export type StorageProvider = "r2" | "supabase";

function hasR2Config() {
  return Boolean(
    process.env.R2_ENDPOINT &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
  );
}

export function getStorageProvider(): StorageProvider {
  if (process.env.STORAGE_PROVIDER === "r2") return "r2";
  if (process.env.STORAGE_PROVIDER === "supabase") return "supabase";
  return hasR2Config() ? "r2" : "supabase";
}

export function getSupabaseStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || "elevated-library-pdfs";
}

export async function createPrivateUploadUrl(input: {
  fileName: string;
  contentType: string;
  prefix?: string;
  expiresIn?: number;
}) {
  const provider = getStorageProvider();

  if (provider === "r2") {
    const data = await createR2UploadUrl(input);
    return { provider, ...data };
  }

  const ext = input.fileName.split(".").pop()?.toLowerCase() || "pdf";
  const key = `${randomKey(input.prefix || "uploads")}.${ext}`;
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.storage
    .from(getSupabaseStorageBucket())
    .createSignedUploadUrl(key);

  if (error || !data) {
    throw new Error(error?.message || "Could not create Supabase upload URL.");
  }

  return {
    provider,
    key,
    url: data.signedUrl,
    token: data.token,
    bucket: getSupabaseStorageBucket(),
  };
}

export async function createPrivateDownloadUrl(key: string, expiresIn = 300) {
  const provider = getStorageProvider();

  if (provider === "r2") {
    return createR2DownloadUrl(key, expiresIn);
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.storage
    .from(getSupabaseStorageBucket())
    .createSignedUrl(key, expiresIn, { download: true });

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Could not create Supabase download URL.");
  }

  return data.signedUrl;
}