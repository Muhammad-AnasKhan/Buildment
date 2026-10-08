import "server-only";
import { randomBytes } from "node:crypto";
import { hashIntegrationSecret } from "@/server/integrations/credential-hash";

export function generateAccessKey(): string {
  return `org_live_${randomBytes(12).toString("hex")}`;
}

export function generateSecretKey(): string {
  return randomBytes(24).toString("base64url");
}

export function hashSecret(secret: string): string {
  return hashIntegrationSecret(secret);
}
