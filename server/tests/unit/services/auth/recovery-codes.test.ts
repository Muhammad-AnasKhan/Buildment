import { describe, expect, it } from "vitest";
import {
  generateRecoveryCodes,
  hashRecoveryCode,
  matchRecoveryCode,
  normalizeRecoveryCode,
} from "../../../../src/services/auth/recovery-codes.js";

describe("recovery codes", () => {
  it("generates eight distinct formatted codes and stores only hashes", () => {
    const { plain, hashes } = generateRecoveryCodes();
    expect(plain).toHaveLength(8);
    expect(new Set(plain).size).toBe(8);
    expect(hashes).toHaveLength(8);
    for (const [index, code] of plain.entries()) {
      expect(code).toMatch(/^[A-Z2-7]{4}-[A-Z2-7]{4}-[A-Z2-7]{4}-[A-Z2-7]{4}$/);
      expect(hashes[index]).toMatch(/^[a-f0-9]{64}$/);
      expect(hashes[index]).not.toBe(code);
    }
  });

  it("normalizes separators and case before hashing", () => {
    expect(normalizeRecoveryCode("abcd-efgh ijkl")).toBe("ABCDEFGHIJKL");
    expect(hashRecoveryCode("abcd-efgh")).toBe(hashRecoveryCode("ABCD EFGH"));
  });

  it("matches a stored hash regardless of formatting and returns -1 otherwise", () => {
    const { plain, hashes } = generateRecoveryCodes();
    expect(matchRecoveryCode(plain[2]!.toLowerCase(), hashes)).toBe(2);
    expect(matchRecoveryCode("ZZZZ-ZZZZ-ZZZZ-ZZZZ", hashes)).toBe(-1);
    expect(matchRecoveryCode("", hashes)).toBe(-1);
  });
});
