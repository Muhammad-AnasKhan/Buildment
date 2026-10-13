import { describe, expect, it } from "vitest";
import { hashIntegrationSecret } from "@/server/integrations/credential-hash";
import { generateAccessKey, generateSecretKey, hashSecret } from "./credentials";

describe("organization credentials", () => {
  it("generates access keys with org prefix", () => {
    expect(generateAccessKey()).toMatch(/^org_live_[a-f0-9]{24}$/);
  });

  it("hashes secrets compatibly with integration auth", () => {
    const secret = generateSecretKey();
    expect(hashSecret(secret)).toBe(hashIntegrationSecret(secret));
  });
});
