import crypto from "crypto";

export function generateToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function randomKey(prefix = "file") {
  const stamp = Date.now();
  const id = crypto.randomBytes(8).toString("hex");
  return `${prefix}/${stamp}-${id}`;
}

function getEncryptionKey() {
  const secret = process.env.APP_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("APP_SECRET must be set and at least 16 characters long.");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptToken(token: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptToken(payload: string | null | undefined) {
  if (!payload) return null;
  try {
    const [ivRaw, tagRaw, encryptedRaw] = payload.split(".");
    if (!ivRaw || !tagRaw || !encryptedRaw) return null;
    const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(ivRaw, "base64url"));
    decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedRaw, "base64url")),
      decipher.final()
    ]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}
