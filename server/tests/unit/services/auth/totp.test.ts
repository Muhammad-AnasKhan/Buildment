import { describe, expect, it } from "vitest";
import {
  generateTotpSecret,
  otpauthUri,
  totpCodeFor,
  verifyTotp,
} from "../../../../src/services/auth/totp.js";

// RFC 6238 test secret: the ASCII string "12345678901234567890" in Base32.
const RFC_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

describe("TOTP (RFC 6238)", () => {
  it("matches the RFC 6238 vectors (last 6 digits of the 8-digit values)", () => {
    const vectors: Array<[number, string]> = [
      [59, "287082"],
      [1111111109, "081804"],
      [1234567890, "005924"],
      [2000000000, "279037"],
      [20000000000, "353130"],
    ];
    for (const [seconds, expected] of vectors) {
      expect(totpCodeFor(RFC_SECRET, seconds * 1000)).toBe(expected);
      expect(verifyTotp(RFC_SECRET, expected, 0, seconds * 1000)).toBe(true);
    }
  });

  it("accepts a neighbouring step for clock drift but not distant steps", () => {
    const now = 1_700_000_000_000;
    const code = totpCodeFor(RFC_SECRET, now);
    expect(verifyTotp(RFC_SECRET, code, 1, now + 30_000)).toBe(true);
    expect(verifyTotp(RFC_SECRET, code, 1, now + 120_000)).toBe(false);
  });

  it("rejects malformed codes without throwing", () => {
    expect(verifyTotp(RFC_SECRET, "12345")).toBe(false);
    expect(verifyTotp(RFC_SECRET, "abcdef")).toBe(false);
    expect(verifyTotp(RFC_SECRET, "")).toBe(false);
  });

  it("generates a distinct Base32 secret and a usable otpauth URI", () => {
    const a = generateTotpSecret();
    const b = generateTotpSecret();
    expect(a).toMatch(/^[A-Z2-7]{32}$/);
    expect(a).not.toBe(b);

    const uri = otpauthUri({ issuer: "Buildment", account: "admin@test.local", secret: a });
    expect(uri.startsWith("otpauth://totp/Buildment%3Aadmin%40test.local?")).toBe(true);
    expect(uri).toContain(`secret=${a}`);
    expect(uri).toContain("digits=6");
    expect(uri).toContain("period=30");
    // Round-trips: the code the URI's secret produces verifies.
    expect(verifyTotp(a, totpCodeFor(a))).toBe(true);
  });
});
