import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { base32Encode } from "./totp.js";

// Backup codes for MFA: the escape hatch when the authenticator device is lost.
// Codes are shown once and stored only as SHA-256 hashes. They are random 80-bit
// values, so a fast hash is appropriate (there is nothing to brute-force) and the
// comparison is constant-time.

const CODE_COUNT = 8;
const CODE_BYTES = 10; // 80 bits -> 16 Base32 characters

/** Uppercases and strips separators so "abcd-efgh" and "ABCDEFGH" match. */
export function normalizeRecoveryCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function hashRecoveryCode(code: string): string {
  return createHash("sha256").update(normalizeRecoveryCode(code), "utf8").digest("hex");
}

function formatCode(raw: string): string {
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
}

/** Fresh codes for the caller to display once; only `hashes` is persisted. */
export function generateRecoveryCodes(): { plain: string[]; hashes: string[] } {
  const plain: string[] = [];
  for (let index = 0; index < CODE_COUNT; index += 1) {
    plain.push(formatCode(base32Encode(randomBytes(CODE_BYTES))));
  }
  return { plain, hashes: plain.map(hashRecoveryCode) };
}

/** Index of the matching stored hash, or -1. Constant-time per candidate. */
export function matchRecoveryCode(code: string, hashes: readonly string[]): number {
  const candidate = Buffer.from(hashRecoveryCode(code), "utf8");
  for (let index = 0; index < hashes.length; index += 1) {
    const stored = Buffer.from(hashes[index] ?? "", "utf8");
    if (stored.length === candidate.length && timingSafeEqual(stored, candidate)) return index;
  }
  return -1;
}
