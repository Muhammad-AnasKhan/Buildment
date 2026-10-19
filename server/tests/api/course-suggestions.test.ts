import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/db/prisma.js";
import { runStudyReminders } from "../../src/services/notifications/reminders.js";
import { notifyCourseCompleted } from "../../src/services/notifications/events.js";
import { createCourseFixture } from "../helpers/fixtures.js";

// Course suggestions for learners with nothing in progress, against a real database: the hourly
// pass (never enrolled / finished everything) and the "what's next" in the completion notice.

let fx: Awaited<ReturnType<typeof createCourseFixture>>;
let nextCourse = { id: "", slug: "", title: "" };
let newcomerId = "";
let finisherId = "";

const signedUp = new Date("2026-10-16T14:20:00Z");
const dayLaterAtThatHour = new Date("2026-10-17T15:05:00Z");

beforeAll(async () => {
  fx = await createCourseFixture();
  const tag = randomUUID().slice(0, 8);
  nextCourse = await prisma.course.create({
    data: { slug: `next-course-${tag}`, title: `Next course ${tag}`, status: "PUBLISHED", mentorId: fx.mentor.id, publishedAt: new Date() },
    select: { id: true, slug: true, title: true },
  });
  newcomerId = (
    await prisma.user.create({
      data: { email: `newcomer-${tag}@test.local`, name: "Newcomer", role: "MENTEE", emailVerified: signedUp, createdAt: signedUp },
    })
  ).id;
  finisherId = fx.learner.id;
  await prisma.enrollment.update({
    where: { id: fx.enrollment.id },
    data: { status: "COMPLETED", percentComplete: 100, completedAt: signedUp, lastActiveAt: signedUp },
  });
});
afterAll(async () => {
  await prisma.user.delete({ where: { id: newcomerId } });
  await prisma.enrollment.deleteMany({ where: { courseId: nextCourse.id } });
  await prisma.course.delete({ where: { id: nextCourse.id } });
  await fx.cleanup();
});

const run = (now: Date, userIds: string[]) => runStudyReminders({ now, userIds });

describe("course suggestions", () => {
  it("suggests a first course to a learner who signed in but never enrolled", async () => {
    expect((await run(new Date("2026-10-17T09:05:00Z"), [newcomerId])).skipped).toEqual({ "recently-active": 1 });

    const result = await run(dayLaterAtThatHour, [newcomerId]);
    expect(result).toMatchObject({ sent: 1, suggested: 1 });

    const [notification] = await prisma.notification.findMany({ where: { userId: newcomerId, type: "course.suggestion" } });
    expect(notification).toMatchObject({ title: "Find your first course", category: "reminder" });
    expect(notification!.url).toMatch(/^\/catalog\//);
    expect(await prisma.emailOutbox.count({ where: { userId: newcomerId, type: "course.suggestion" } })).toBe(1);
    expect((await run(dayLaterAtThatHour, [newcomerId])).sent).toBe(0); // same hour again
  });

  it("suggests the next course to a learner who finished everything, preferring the same instructor", async () => {
    await run(dayLaterAtThatHour, [finisherId]);
    const [notification] = await prisma.notification.findMany({ where: { userId: finisherId, type: "course.suggestion" } });
    expect(notification).toMatchObject({ title: "Ready for your next course?", url: `/catalog/${nextCourse.slug}` });
    expect(notification!.body).toContain(`You finished ${fx.course.title}`);
  });

  it("leaves learners alone once they have a course in progress, or are waiting on a payment", async () => {
    const enrollment = await prisma.enrollment.create({
      data: {
        courseId: nextCourse.id,
        userId: newcomerId,
        lifecycle: "PAYMENT_REQUIRED",
        status: "ASSIGNED",
        source: "DIRECT",
        createdAt: signedUp,
      },
    });
    expect((await run(new Date("2026-10-19T15:05:00Z"), [newcomerId])).users).toBe(0);

    await prisma.enrollment.update({ where: { id: enrollment.id }, data: { lifecycle: "ACTIVE" } });
    const result = await run(new Date("2026-10-19T15:05:00Z"), [newcomerId]);
    expect(result.suggested).toBe(0);
    expect(await prisma.notification.count({ where: { userId: newcomerId, type: "study.reminder" } })).toBe(1);
    await prisma.enrollment.delete({ where: { id: enrollment.id } });
  });

  it("does not suggest courses to instructors", async () => {
    expect((await run(dayLaterAtThatHour, [fx.mentor.id])).users).toBe(0);
  });
});

describe("course completed notice", () => {
  it("points at a catalog course when nothing else is in progress", async () => {
    await prisma.notification.deleteMany({ where: { userId: finisherId, type: "course.completed" } });
    await prisma.$transaction((tx) => notifyCourseCompleted(tx, fx.enrollment.id));
    const notice = await prisma.notification.findFirstOrThrow({ where: { userId: finisherId, type: "course.completed" } });
    expect(notice.url).toBe(`/catalog/${nextCourse.slug}`);
    expect(notice.body).toContain(`Try ${nextCourse.title}`);
  });

  it("points at a course already in progress before suggesting a new one", async () => {
    const enrollment = await prisma.enrollment.create({
      data: { courseId: nextCourse.id, userId: finisherId, lifecycle: "ACTIVE", status: "IN_PROGRESS", source: "DIRECT", lastActiveAt: new Date() },
    });
    await prisma.notification.deleteMany({ where: { userId: finisherId, type: "course.completed" } });
    await prisma.$transaction((tx) => notifyCourseCompleted(tx, fx.enrollment.id));
    const notice = await prisma.notification.findFirstOrThrow({ where: { userId: finisherId, type: "course.completed" } });
    expect(notice.url).toBe(`/courses/${nextCourse.slug}`);
    expect(notice.body).toContain(`Pick up ${nextCourse.title} next.`);
    await prisma.enrollment.delete({ where: { id: enrollment.id } });
  });
});
