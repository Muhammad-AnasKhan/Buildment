import { describe, expect, it } from "vitest";
import { hashIntegrationSecret, verifyIntegrationSecret } from "./credential-hash";

describe("verifyIntegrationSecret", () => {
  it("accepts a valid secret", () => {
    const secret = "test-secret-key";
    const hash = hashIntegrationSecret(secret);
    expect(verifyIntegrationSecret(secret, hash)).toBe(true);
  });

  it("rejects a wrong secret", () => {
    const hash = hashIntegrationSecret("correct");
    expect(verifyIntegrationSecret("wrong", hash)).toBe(false);
  });

  it("rejects mismatched hash lengths without throwing", () => {
    expect(verifyIntegrationSecret("x", "short")).toBe(false);
  });
});
