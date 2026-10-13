import { describe, expect, it } from "vitest";
import { canAccessHelpThread, canReplyToHelpThread, canResolveHelpThread } from "./access";

const course = { mentorId: "mentor_1" };

describe("canAccessHelpThread", () => {
  it("allows the mentee who owns the thread", () => {
    expect(
      canAccessHelpThread({ id: "mentee_1", role: "MENTEE" }, { menteeId: "mentee_1" }, course)
    ).toBe(true);
  });

  it("rejects another mentee", () => {
    expect(
      canAccessHelpThread({ id: "mentee_2", role: "MENTEE" }, { menteeId: "mentee_1" }, course)
    ).toBe(false);
  });

  it("allows the course mentor", () => {
    expect(
      canAccessHelpThread({ id: "mentor_1", role: "MENTOR" }, { menteeId: "mentee_1" }, course)
    ).toBe(true);
  });

  it("rejects a mentor who does not own the course", () => {
    expect(
      canAccessHelpThread({ id: "mentor_2", role: "MENTOR" }, { menteeId: "mentee_1" }, course)
    ).toBe(false);
  });
});

describe("canReplyToHelpThread", () => {
  const open = { menteeId: "mentee_1", status: "OPEN" as const };

  it("allows mentee on open threads", () => {
    expect(canReplyToHelpThread({ id: "mentee_1", role: "MENTEE" }, open, course)).toBe(true);
  });

  it("blocks replies on resolved threads", () => {
    expect(
      canReplyToHelpThread(
        { id: "mentee_1", role: "MENTEE" },
        { menteeId: "mentee_1", status: "RESOLVED" },
        course
      )
    ).toBe(false);
  });
});

describe("canResolveHelpThread", () => {
  it("allows the course mentor", () => {
    expect(canResolveHelpThread({ id: "mentor_1", role: "MENTOR" }, course)).toBe(true);
  });

  it("rejects mentees", () => {
    expect(canResolveHelpThread({ id: "mentee_1", role: "MENTEE" }, course)).toBe(false);
  });
});
