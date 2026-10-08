import { describe, expect, it } from "vitest";
import { learnAccessDenial } from "./resolve-learn-enrollment";

describe("learnAccessDenial", () => {
  it("requires an enrollment row", () => {
    expect(learnAccessDenial(null)).toBe("not_enrolled");
  });

  it("blocks payment-required enrollments", () => {
    expect(
      learnAccessDenial({
        lifecycle: "PAYMENT_REQUIRED",
        userId: "u1",
      } as const)
    ).toBe("payment_required");
  });

  it("blocks rows without a linked user", () => {
    expect(
      learnAccessDenial({
        lifecycle: "ACTIVE",
        userId: null,
      } as const)
    ).toBe("pending_account");
  });

  it("allows active enrollments", () => {
    expect(
      learnAccessDenial({
        lifecycle: "ACTIVE",
        userId: "u1",
      } as const)
    ).toBeNull();
  });

  it("allows completed enrollments", () => {
    expect(
      learnAccessDenial({
        lifecycle: "COMPLETED",
        userId: "u1",
      } as const)
    ).toBeNull();
  });
});
