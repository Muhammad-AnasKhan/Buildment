import { describe, expect, it } from "vitest";
import {
  AllocationError,
  assertOrganizationCourseAllocation,
  availableEnrollmentCount,
} from "./allocation";

describe("assertOrganizationCourseAllocation", () => {
  const base = {
    id: "oc1",
    organizationId: "org1",
    courseId: "c1",
    isAllowed: true,
    maxEnrollments: 10,
    currentEnrollments: 5,
    expiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("passes a valid allocation", () => {
    expect(assertOrganizationCourseAllocation(base).id).toBe("oc1");
  });

  it("rejects expired allocation", () => {
    expect(() =>
      assertOrganizationCourseAllocation({
        ...base,
        expiresAt: new Date("2020-01-01"),
      })
    ).toThrow(AllocationError);
  });

  it("rejects at capacity", () => {
    expect(() =>
      assertOrganizationCourseAllocation({
        ...base,
        currentEnrollments: 10,
      })
    ).toThrow(AllocationError);
  });
});

describe("availableEnrollmentCount", () => {
  it("returns remaining slots", () => {
    expect(
      availableEnrollmentCount({
        id: "x",
        organizationId: "o",
        courseId: "c",
        isAllowed: true,
        maxEnrollments: 100,
        currentEnrollments: 42,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ).toBe(58);
  });
});
