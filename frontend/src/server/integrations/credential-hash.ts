import { createHash, timingSafeEqual } from "node:crypto";

export function hashIntegrationSecret(secret: string): string {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}

export function verifyIntegrationSecret(secret: string, secretHash: string): boolean {
  const candidate = hashIntegrationSecret(secret);
  const a = Buffer.from(candidate, "utf8");
  const b = Buffer.from(secretHash, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
