import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/db/prisma.js";
import { runStudyReminders } from "../../src/services/notifications/reminders.js";
import { createCourseFixture } from "../helpers/fixtures.js";

// The hourly reminder job against a real database, scoped to this file's learner.

let fx: Awaited<ReturnType<typeof createCourseFixture>>;
let secondCourseId = "";

const lastStudied = new Date("2026-10-16T14:20:00Z");
const nextDayAtThatHour = new Date("2026-10-17T15:05:00Z");

beforeAll(async () => {
  fx = await createCourseFixture();
  const second = await prisma.course.create({
    data: {
      slug: `second-course-${fx.tag}`,
      title: `Second course ${fx.tag}`,
      status: "PUBLISHED",
      mentorId: fx.mentor.id,
      publishedAt: new Date(),
    },
  });
  secondCourseId = second.id;
  await prisma.enrollment.create({
    data: { courseId: second.id, userId: fx.learner.id, lifecycle: "ACTIVE", status: "ASSIGNED", source: "DIRECT" },
  });
  await prisma.enrollment.update({
    where: { id: fx.enrollment.id },
    data: { lastActiveAt: lastStudied, percentComplete: 40 },
  });
});
afterAll(async () => {
  await prisma.enrollment.deleteMany({ where: { courseId: secondCourseId } });
  await prisma.course.delete({ where: { id: secondCourseId } });
  await fx.cleanup();
});

const run = (now: Date) => runStudyReminders({ now, userIds: [fx.learner.id] });

describe("study reminders", () => {
  it("waits for the learner's hour, then sends one reminder covering every course", async () => {
    expect((await run(new Date("2026-10-17T09:05:00Z"))).sent).toBe(0); // away < 1 day
    expect((await run(new Date("2026-10-17T14:05:00Z"))).skipped).toEqual({ "not-this-hour": 1 });

    const result = await run(nextDayAtThatHour);
    expect(result.sent).toBe(1);

    const notifications = await prisma.notification.findMany({ where: { userId: fx.learner.id, type: "study.reminder" } });
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      title: `Pick up ${fx.course.title} where you left off`,
      url: `/courses/${fx.course.slug}`,
      courseId: fx.course.id,
    });
    expect(notifications[0]!.body).toContain(`Also waiting: Second course ${fx.tag}`);

    const emails = await prisma.emailOutbox.findMany({ where: { userId: fx.learner.id, type: "study.reminder" } });
    expect(emails).toHaveLength(1);
    expect(emails[0]!.html).toContain(`second-course-${fx.tag}`);

    const enrollments = await prisma.enrollment.findMany({ where: { userId: fx.learner.id } });
    expect(enrollments.every((enrollment) => enrollment.lastNudgeSentAt?.getTime() === nextDayAtThatHour.getTime())).toBe(true);
  });

  it("does nothing when the same hour runs twice, and waits for the next step of the cadence", async () => {
    expect((await run(nextDayAtThatHour)).sent).toBe(0);
    expect((await run(new Date("2026-10-18T15:05:00Z"))).skipped).toEqual({ "not-due": 1 }); // day 2, next step is day 3
    expect((await run(new Date("2026-10-19T15:05:00Z"))).sent).toBe(1); // day 3
    expect(await prisma.studyReminderLog.count({ where: { userId: fx.learner.id } })).toBe(2);
  });

  it("starts the cadence again once the learner comes back", async () => {
    await prisma.enrollment.update({ where: { id: fx.enrollment.id }, data: { lastActiveAt: new Date("2026-10-20T15:30:00Z") } });
    expect((await run(new Date("2026-10-20T18:05:00Z"))).skipped).toEqual({ "recently-active": 1 });
    expect((await run(new Date("2026-10-21T16:05:00Z"))).sent).toBe(1);
  });

  it("respects a learner who muted reminders on both channels", async () => {
    await prisma.notificationPreference.create({
      data: { userId: fx.learner.id, emailOptOut: ["reminder"], inAppOptOut: ["reminder"] },
    });
    expect((await run(new Date("2026-10-24T16:05:00Z"))).skipped).toEqual({ muted: 1 });
  });
});
