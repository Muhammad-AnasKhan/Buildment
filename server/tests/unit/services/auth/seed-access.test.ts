import { describe, expect, it } from "vitest";
import { shouldBypassProgressGating } from "../../../../src/services/auth/seed-access.js";

describe("shouldBypassProgressGating", () => {
  it("lets admin-marked testers skip sequential locks", () => {
    expect(shouldBypassProgressGating({ email: "learner@example.com", testerEnabled: true })).toBe(true);
  });

  it("keeps ordinary learners gated", () => {
    expect(shouldBypassProgressGating({ email: "learner@example.com", testerEnabled: false })).toBe(false);
  });
});
