import { describe, expect, it } from "vitest";
import {
  canAccessLearnSurface,
  canAccessRole,
  homeRouteForRole,
  isMentorOfCourse,
  canAccessTeachSurface,
} from "../../../../src/server/auth/access-rules";

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

describe("canAccessTeachSurface", () => {
  it("rejects mentees by role", () => {
    expect(canAccessTeachSurface({ role: "MENTEE" })).toBe(false);
  });

  it("allows mentor role for teaching", () => {
    expect(canAccessTeachSurface({ role: "MENTOR" })).toBe(true);
  });
});

describe("surface access", () => {
  it("allows learners into learn surface", () => {
    expect(canAccessLearnSurface({ role: "MENTEE" })).toBe(true);
    expect(canAccessLearnSurface({ role: "MENTOR" })).toBe(true);
  });

  it("allows admin into learn shell", () => {
    expect(canAccessLearnSurface({ role: "ADMIN" })).toBe(true);
  });

  it("rejects mentees from teach surface", () => {
    expect(canAccessTeachSurface({ role: "MENTEE" })).toBe(false);
  });
});

describe("homeRouteForRole", () => {
  it("routes mentees to the dashboard", () => {
    expect(homeRouteForRole("MENTEE")).toBe("/dashboard");
  });

  it("routes mentors to their course list", () => {
    expect(homeRouteForRole("MENTOR")).toBe("/workspace");
  });

  it("routes admins to the admin home", () => {
    expect(homeRouteForRole("ADMIN")).toBe("/admin");
  });
});

describe("role boundaries", () => {
  it("keeps administration exclusive to admins", () => {
    expect(canAccessRole("MENTOR", ["ADMIN"])).toBe(false);
    expect(canAccessRole("MENTEE", ["ADMIN"])).toBe(false);
    expect(canAccessRole("ADMIN", ["ADMIN"])).toBe(true);
  });
  it("allows mentors and admins to teach by role", () => {
    expect(canAccessTeachSurface({ role: "MENTOR" })).toBe(true);
    expect(canAccessTeachSurface({ role: "ADMIN" })).toBe(true);
  });
  it("denies revoked mentors ownership privileges", () => {
    expect(isMentorOfCourse("owner", "MENTEE", { mentorId: "owner" })).toBe(false);
  });
});
