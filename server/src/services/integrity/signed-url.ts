import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env.js";

// Mentors view snapshots through links that expire after a few minutes. The link
// is the credential, so it is signed with a server secret and checked before any
// bytes leave storage.

export const SNAPSHOT_URL_TTL_SECONDS = 10 * 60;

const secret = env.INTEGRITY_MEDIA_SECRET ?? randomBytes(32).toString("hex");

function signature(snapshotId: string, expiresAt: number): string {
  return createHmac("sha256", secret).update(`${snapshotId}.${expiresAt}`).digest("base64url");
}

export function signedSnapshotUrl(snapshotId: string, now = Date.now()): { url: string; expiresAt: Date } {
  const expiresAt = Math.floor(now / 1000) + SNAPSHOT_URL_TTL_SECONDS;
  return {
    url: `/api/v1/media/integrity/${snapshotId}.jpg?exp=${expiresAt}&sig=${signature(snapshotId, expiresAt)}`,
    expiresAt: new Date(expiresAt * 1000),
  };
}

export function verifySnapshotSignature(snapshotId: string, exp: unknown, sig: unknown, now = Date.now()): boolean {
  if (typeof exp !== "string" || typeof sig !== "string" || !/^\d{1,12}$/.test(exp)) return false;
  const expiresAt = Number(exp);
  const nowSeconds = Math.floor(now / 1000);
  if (expiresAt < nowSeconds || expiresAt > nowSeconds + SNAPSHOT_URL_TTL_SECONDS + 60) return false;
  const expected = Buffer.from(signature(snapshotId, expiresAt));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
