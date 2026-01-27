import crypto from "crypto";

const algorithm = "aes-256-gcm";
const baseSecret = process.env.NEXTAUTH_SECRET;

if (!baseSecret) {
  throw new Error("NEXTAUTH_SECRET is not set");
}

// derive a 32-byte key from it
const key = crypto
  .createHash("sha256")
  .update(baseSecret + "db-encryption") // domain separation
  .digest();

export function encrypt(text: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(payload: string) {
  const data = Buffer.from(payload, "base64");
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const text = data.slice(28);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(text) + decipher.final("utf8");
}

export function hashEmail(email: string) {
  return crypto.createHash("sha256").update(email.toLowerCase()).digest("hex");
}
