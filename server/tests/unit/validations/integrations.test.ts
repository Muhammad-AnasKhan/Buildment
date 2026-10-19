import { describe, expect, it } from "vitest";
import { enrollmentLookupQuery } from "../../../src/validations/integrations.js";

describe("enrollmentLookupQuery", () => {
  it("requires course and email when no external id", () => {
    expect(enrollmentLookupQuery.safeParse({}).success).toBe(false);
    expect(enrollmentLookupQuery.safeParse({ course_id: "c1" }).success).toBe(false);
    expect(enrollmentLookupQuery.safeParse({ course_id: "c1", learner_email: "a@b.com" }).success).toBe(true);
  });

  it("allows external_assignment_id alone", () => {
    expect(enrollmentLookupQuery.safeParse({ external_assignment_id: "path-9" }).success).toBe(true);
  });

  it("lower-cases the learner email", () => {
    const parsed = enrollmentLookupQuery.parse({ course_id: "c1", learner_email: "Ada@Example.com" });
    expect(parsed.learner_email).toBe("ada@example.com");
  });
});
