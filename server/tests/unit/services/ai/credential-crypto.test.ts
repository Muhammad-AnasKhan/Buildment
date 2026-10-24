import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, parseEncryptionKey } from "../../../../src/services/ai/credential-crypto.js";

const key = randomBytes(32);
const secret = "sk-or-v1-0123456789abcdef0123456789abcdef";

function flipFirstByte(base64: string) {
  const bytes = Buffer.from(base64, "base64");
  bytes[0] = bytes[0]! ^ 0xff;
  return bytes.toString("base64");
}

describe("credential crypto", () => {
  it("round trips a key and never stores the plaintext", () => {
    const encrypted = encryptSecret(secret, key, "user-1");
    expect(JSON.stringify(encrypted)).not.toContain(secret);
    expect(Buffer.from(encrypted.iv, "base64")).toHaveLength(12);
    expect(Buffer.from(encrypted.authTag, "base64")).toHaveLength(16);
    expect(decryptSecret(encrypted, key, "user-1")).toBe(secret);
  });

  it("uses a fresh IV for every encryption", () => {
    const a = encryptSecret(secret, key, "user-1");
    const b = encryptSecret(secret, key, "user-1");
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it("detects a tampered ciphertext, IV or tag", () => {
    const encrypted = encryptSecret(secret, key, "user-1");
    expect(() => decryptSecret({ ...encrypted, ciphertext: flipFirstByte(encrypted.ciphertext) }, key, "user-1")).toThrow();
    expect(() => decryptSecret({ ...encrypted, iv: flipFirstByte(encrypted.iv) }, key, "user-1")).toThrow();
    expect(() => decryptSecret({ ...encrypted, authTag: flipFirstByte(encrypted.authTag) }, key, "user-1")).toThrow();
  });

  it("rejects a truncated tag instead of checking fewer bits", () => {
    const encrypted = encryptSecret(secret, key, "user-1");
    const short = Buffer.from(encrypted.authTag, "base64").subarray(0, 4).toString("base64");
    expect(() => decryptSecret({ ...encrypted, authTag: short }, key, "user-1")).toThrow();
  });

  it("refuses to decrypt for another user or with another server key", () => {
    const encrypted = encryptSecret(secret, key, "user-1");
    expect(() => decryptSecret(encrypted, key, "user-2")).toThrow();
    expect(() => decryptSecret(encrypted, randomBytes(32), "user-1")).toThrow();
  });

  it("accepts only a 32 byte base64 server key", () => {
    expect(parseEncryptionKey(undefined)).toBeNull();
    expect(parseEncryptionKey("")).toBeNull();
    expect(parseEncryptionKey(Buffer.alloc(16).toString("base64"))).toBeNull();
    expect(parseEncryptionKey(key.toString("base64"))?.equals(key)).toBe(true);
  });
});
