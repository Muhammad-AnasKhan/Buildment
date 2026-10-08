import { describe, expect, it } from "vitest";
import { missingEnrollmentLookupParams } from "./enrollment-lookup";

describe("missingEnrollmentLookupParams", () => {
  it("requires course and email when no external id", () => {
    expect(missingEnrollmentLookupParams(new URLSearchParams())).toBe(true);
    expect(
      missingEnrollmentLookupParams(new URLSearchParams({ course_id: "c1" }))
    ).toBe(true);
    expect(
      missingEnrollmentLookupParams(
        new URLSearchParams({ course_id: "c1", learner_email: "a@b.com" })
      )
    ).toBe(false);
  });

  it("allows external_assignment_id alone", () => {
    expect(
      missingEnrollmentLookupParams(
        new URLSearchParams({ external_assignment_id: "path-9" })
      )
    ).toBe(false);
  });
});
