import { describe, expect, it } from "vitest";
import {
  pathmentEnrollmentPatch,
  shouldAttachPathmentOrg,
} from "./attach-org-enrollment";

describe("shouldAttachPathmentOrg", () => {
  it("allows when org is unset", () => {
    expect(shouldAttachPathmentOrg(null, "org_a")).toBe(true);
  });

  it("allows when org matches", () => {
    expect(shouldAttachPathmentOrg("org_a", "org_a")).toBe(true);
  });

  it("blocks cross-org attach", () => {
    expect(shouldAttachPathmentOrg("org_b", "org_a")).toBe(false);
  });
});

describe("pathmentEnrollmentPatch", () => {
  it("stores assignment metadata", () => {
    expect(
      pathmentEnrollmentPatch({
        organizationId: "org_1",
        mentorId: "mentor-x",
        assignmentId: "assign-1",
      })
    ).toEqual({
      organizationId: "org_1",
      externalMentorId: "mentor-x",
      externalAssignmentId: "assign-1",
    });
  });
});
