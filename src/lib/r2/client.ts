import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomKey } from "@/lib/security/token";

export function getR2Client() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing R2 configuration.");
  }

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey }
  });
}

export function getBucketName() {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("Missing R2_BUCKET_NAME.");
  return bucket;
}

export async function createDownloadUrl(key: string, expiresIn = 300) {
  const client = getR2Client();
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: getBucketName(), Key: key }),
    { expiresIn }
  );
}

export async function createUploadUrl(input: { fileName: string; contentType: string; prefix?: string; expiresIn?: number }) {
  const ext = input.fileName.split(".").pop()?.toLowerCase() || "bin";
  const key = `${randomKey(input.prefix || "uploads")}.${ext}`;
  const client = getR2Client();
  const url = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: getBucketName(), Key: key, ContentType: input.contentType }),
    { expiresIn: input.expiresIn || 300 }
  );
  return { key, url };
}
