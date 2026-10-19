import { describe, expect, it } from "vitest";
import { pathmentAssignmentId } from "../../../../../src/services/integrations/pathment/enrollment-idempotency.js";

describe("pathmentAssignmentId", () => {
  it("uses external id when provided", () => {
    expect(
      pathmentAssignmentId({
        organizationId: "org",
        courseId: "course",
        studentEmail: "a@b.com",
        externalAssignmentId: "path-123",
      })
    ).toBe("path-123");
  });

  it("is deterministic without external id", () => {
    const input = {
      organizationId: "org",
      courseId: "course",
      studentEmail: "Student@Example.com",
      mentorId: "mentor-1",
    };
    expect(pathmentAssignmentId(input)).toBe(pathmentAssignmentId(input));
  });
});
