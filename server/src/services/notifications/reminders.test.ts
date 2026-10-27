import { describe, expect, it } from "vitest";
import {
  circularMedianMinute,
  planStudyReminder,
  preferredSendHourUtc,
  rankReminderCourses,
  reminderMessage,
  type ReminderCourse,
} from "./reminders.js";

const at = (iso: string) => new Date(iso);
const base = {
  activeDayStarts: [] as Date[],
  remindersSinceActive: 0,
  remindersLast24h: 0,
  dailyLimit: 1,
};

describe("preferredSendHourUtc", () => {
  it("for a new user, picks the first hourly slot at or after the time they were last here", () => {
    expect(preferredSendHourUtc([], at("2026-10-17T14:20:00Z"))).toBe(15);
    expect(preferredSendHourUtc([], at("2026-10-17T14:00:00Z"))).toBe(14);
    expect(preferredSendHourUtc([], at("2026-10-17T23:40:00Z"))).toBe(0);
  });

  it("with enough history, sends 30 minutes before the usual start time", () => {
    const starts = ["2026-10-10T20:40:00Z", "2026-10-11T20:20:00Z", "2026-10-12T20:35:00Z"].map(at);
    expect(preferredSendHourUtc(starts, at("2026-10-12T22:00:00Z"))).toBe(20); // median 20:35 → 20:05
  });

  it("keeps a cluster around midnight together", () => {
    expect(circularMedianMinute([23 * 60 + 50, 10, 20])).toBe(10);
    const starts = ["2026-10-10T23:50:00Z", "2026-10-11T00:10:00Z", "2026-10-12T00:20:00Z"].map(at);
    expect(preferredSendHourUtc(starts, at("2026-10-12T01:00:00Z"))).toBe(23); // median 00:10 → 23:40
  });
});

describe("planStudyReminder", () => {
  it("reminds a new user about 24 hours after their last visit, at that time of day", () => {
    const lastActiveAt = at("2026-10-17T14:20:00Z");
    const plan = (now: string) => planStudyReminder({ ...base, now: at(now), lastActiveAt, fallbackAnchor: lastActiveAt });

    expect(plan("2026-10-17T15:05:00Z")).toEqual({ send: false, reason: "recently-active" });
    expect(plan("2026-10-18T14:05:00Z")).toEqual({ send: false, reason: "not-this-hour" });
    expect(plan("2026-10-18T15:05:00Z")).toEqual({ send: true, step: 1, sendHourUtc: 15 });
  });

  it("uses the enrollment time when the user has never been active", () => {
    const enrolledAt = at("2026-10-17T09:30:00Z");
    expect(
      planStudyReminder({ ...base, now: at("2026-10-18T10:05:00Z"), lastActiveAt: null, fallbackAnchor: enrolledAt })
    ).toEqual({ send: true, step: 1, sendHourUtc: 10 });
  });

  it("does not remind someone who was active today, even at their usual hour", () => {
    const starts = ["2026-10-14T20:30:00Z", "2026-10-15T20:30:00Z", "2026-10-16T20:30:00Z"].map(at);
    const decision = planStudyReminder({
      ...base,
      now: at("2026-10-17T20:05:00Z"),
      lastActiveAt: at("2026-10-17T08:00:00Z"),
      fallbackAnchor: at("2026-10-01T00:00:00Z"),
      activeDayStarts: starts,
    });
    expect(decision).toEqual({ send: false, reason: "recently-active" });
  });

  it("follows the 1, 3, 7, 14, 30 day cadence and then stops", () => {
    const lastActiveAt = at("2026-10-01T10:00:00Z");
    const plan = (now: string, remindersSinceActive: number) =>
      planStudyReminder({ ...base, now: at(now), lastActiveAt, fallbackAnchor: lastActiveAt, remindersSinceActive });

    expect(plan("2026-10-03T10:05:00Z", 1)).toEqual({ send: false, reason: "not-due" }); // day 2, next step is day 3
    expect(plan("2026-10-04T10:05:00Z", 1)).toMatchObject({ send: true, step: 3 });
    expect(plan("2026-10-08T10:05:00Z", 2)).toMatchObject({ send: true, step: 7 });
    expect(plan("2026-11-05T10:05:00Z", 5)).toEqual({ send: false, reason: "cadence-finished" });
  });

  it("applies the daily limit and the off switch", () => {
    const lastActiveAt = at("2026-10-10T10:00:00Z");
    const input = { ...base, now: at("2026-10-17T10:05:00Z"), lastActiveAt, fallbackAnchor: lastActiveAt, remindersSinceActive: 2 };
    expect(planStudyReminder({ ...input, remindersLast24h: 1 })).toEqual({ send: false, reason: "daily-limit" });
    expect(planStudyReminder({ ...input, dailyLimit: 0 })).toEqual({ send: false, reason: "disabled" });
  });
});

describe("reminder grouping", () => {
  const course = (over: Partial<ReminderCourse>): ReminderCourse => ({
    enrollmentId: "e",
    courseId: "c",
    title: "Course",
    slug: "course",
    percentComplete: 0,
    lastActiveAt: null,
    createdAt: at("2026-10-01T00:00:00Z"),
    ...over,
  });

  it("leads with the most recently studied course, then the newest unstarted one", () => {
    const ranked = rankReminderCourses([
      course({ courseId: "new", title: "SQL", createdAt: at("2026-10-15T00:00:00Z") }),
      course({ courseId: "old", title: "Node", lastActiveAt: at("2026-10-05T00:00:00Z"), percentComplete: 20 }),
      course({ courseId: "recent", title: "React", lastActiveAt: at("2026-10-12T00:00:00Z"), percentComplete: 68 }),
      course({ courseId: "older", title: "CSS", createdAt: at("2026-09-01T00:00:00Z") }),
    ]);
    expect(ranked.map((c) => c.courseId)).toEqual(["recent", "old", "new", "older"]);
  });

  it("writes one message for every course", () => {
    const ranked = rankReminderCourses([
      course({ title: "React", slug: "react", lastActiveAt: at("2026-10-12T00:00:00Z"), percentComplete: 68 }),
      course({ title: "Node" }),
      course({ title: "SQL" }),
      course({ title: "CSS" }),
    ]);
    const message = reminderMessage(ranked);
    expect(message.title).toBe("Pick up React where you left off");
    expect(message.url).toBe("/courses/react");
    expect(message.body).toContain("68% through");
    expect(message.body).toContain("Also waiting: Node, SQL and 1 more.");
  });

  it("invites a learner who has not started to begin", () => {
    expect(reminderMessage([course({ title: "SQL" })]).title).toBe("Ready to start SQL?");
  });
});
