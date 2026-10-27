import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// RFC 6238 TOTP (SHA-1, 6 digits, 30s step) implemented with node:crypto so the
// API needs no extra dependency. Secrets are Base32; the account confirms one
// code before MFA is enforced, so a mis-scanned secret can never lock anyone out.

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const DIGITS = 6;
const PERIOD_SECONDS = 30;
const DEFAULT_WINDOW = 1;

/** 20 random bytes = 160 bits, the length RFC 4226 recommends for HMAC-SHA1. */
export function generateTotpSecret(byteLength = 20): string {
  return base32Encode(randomBytes(byteLength));
}

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(secret: string): Buffer {
  const clean = secret.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** The 6-digit code for a given step counter. */
function codeForCounter(key: Buffer, counter: number): string {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", key).update(buffer).digest();
  const offset = digest[digest.length - 1]! & 0x0f;
  const binary =
    ((digest[offset]! & 0x7f) << 24) |
    ((digest[offset + 1]! & 0xff) << 16) |
    ((digest[offset + 2]! & 0xff) << 8) |
    (digest[offset + 3]! & 0xff);
  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

/** The code for the step containing `now` (ms). Used by tests and by clients that display it. */
export function totpCodeFor(secret: string, now = Date.now()): string {
  const key = base32Decode(secret);
  return codeForCounter(key, Math.floor(now / 1000 / PERIOD_SECONDS));
}

/** Verifies a code against the current step and ±`window` neighbours (clock drift). */
export function verifyTotp(secret: string, code: string, window = DEFAULT_WINDOW, now = Date.now()): boolean {
  const normalized = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;
  const key = base32Decode(secret);
  if (key.length === 0) return false;
  const counter = Math.floor(now / 1000 / PERIOD_SECONDS);
  const candidate = Buffer.from(normalized, "utf8");
  for (let offset = -window; offset <= window; offset += 1) {
    const expected = Buffer.from(codeForCounter(key, counter + offset), "utf8");
    if (expected.length === candidate.length && timingSafeEqual(expected, candidate)) return true;
  }
  return false;
}

/** otpauth:// URI an authenticator app can read (or the admin types the secret by hand). */
export function otpauthUri(input: { issuer: string; account: string; secret: string }): string {
  const label = encodeURIComponent(`${input.issuer}:${input.account}`);
  const params = new URLSearchParams({
    secret: input.secret,
    issuer: input.issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(PERIOD_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
