import { describe, expect, it } from "vitest";
import { canAccessRole, homeRouteForRole, isMentorOfCourse } from "./access-rules";

describe("canAccessRole", () => {
  it("allows a role that's in the allowed list", () => {
    expect(canAccessRole("MENTOR", ["MENTOR", "ADMIN"])).toBe(true);
  });

  it("rejects a role that's not in the allowed list", () => {
    expect(canAccessRole("MENTEE", ["MENTOR", "ADMIN"])).toBe(false);
  });
});

describe("isMentorOfCourse", () => {
  it("allows the course's own mentor", () => {
    expect(isMentorOfCourse("user_1", "MENTOR", { mentorId: "user_1" })).toBe(true);
  });

  it("rejects a different mentor", () => {
    expect(isMentorOfCourse("user_2", "MENTOR", { mentorId: "user_1" })).toBe(false);
  });

  it("always allows an admin, regardless of ownership", () => {
    expect(isMentorOfCourse("user_2", "ADMIN", { mentorId: "user_1" })).toBe(true);
  });
});

describe("homeRouteForRole", () => {
  it("routes mentees to the dashboard", () => {
    expect(homeRouteForRole("MENTEE")).toBe("/dashboard");
  });

  it("routes mentors to their course list", () => {
    expect(homeRouteForRole("MENTOR")).toBe("/courses");
  });

  it("routes admins to the admin home", () => {
    expect(homeRouteForRole("ADMIN")).toBe("/admin");
  });
});
