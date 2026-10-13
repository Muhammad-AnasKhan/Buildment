import { describe, expect, it } from "vitest";
import {
  enrollmentGrantsContentAccess,
  lifecycleForPathmentEnrollment,
  lifecycleForSignedInEnrollment,
} from "./lifecycle";

describe("enrollment lifecycle", () => {
  it("grants access only for active or completed enrollments", () => {
    expect(enrollmentGrantsContentAccess("ACTIVE")).toBe(true);
    expect(enrollmentGrantsContentAccess("COMPLETED")).toBe(true);
    expect(enrollmentGrantsContentAccess("PAYMENT_REQUIRED")).toBe(false);
    expect(enrollmentGrantsContentAccess("PENDING_ACCOUNT")).toBe(false);
  });

  it("maps signed-in enrollments to payment or active", () => {
    expect(lifecycleForSignedInEnrollment("FREE")).toBe("ACTIVE");
    expect(lifecycleForSignedInEnrollment("PAID")).toBe("PAYMENT_REQUIRED");
  });

  it("maps Pathment rows before account linking", () => {
    expect(lifecycleForPathmentEnrollment("FREE", false)).toBe("PENDING_ACCOUNT");
    expect(lifecycleForPathmentEnrollment("PAID", true)).toBe("PAYMENT_REQUIRED");
    expect(lifecycleForPathmentEnrollment("FREE", true)).toBe("ACTIVE");
  });
});
