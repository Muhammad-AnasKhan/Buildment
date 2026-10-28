import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { createSession } from "../../src/services/auth/session.js";
import { utcDateOnly } from "../../src/services/progress/heartbeat.js";
import { completeChapter, createCourseFixture } from "../helpers/fixtures.js";

const app = createApp();
const DAY_MS = 24 * 60 * 60 * 1000;
let fx: Awaited<ReturnType<typeof createCourseFixture>>;
let mentorToken = "";

beforeAll(async () => {
  fx = await createCourseFixture();
  mentorToken = (await createSession(fx.mentor.id)).sessionToken;
});
afterAll(async () => {
  // Engagement rows, activity days and notifications go with the users (ON DELETE CASCADE).
  await fx.cleanup();
});

const learner = () => ({ Authorization: `Bearer ${fx.learnerToken}` });
const track = (body: object, headers = learner()) => request(app).post("/api/v1/events").set(headers).send(body);
const submitQuiz = (optionId: string) =>
  request(app)
    .post(`/api/v1/chapters/${fx.chapterB.id}/quiz/submit`)
    .set(learner())
    .send({ answers: fx.quizChapterBlocks.map((block) => ({ blockId: block.id, selected: [optionId] })) });
const markComplete = (chapterId: string) =>
  request(app).post(`/api/v1/chapters/${chapterId}/complete`).set(learner());

describe("POST /api/v1/events", () => {
  it("requires a session and rejects unknown or incomplete events", async () => {
    expect((await request(app).post("/api/v1/events").send({ type: "session_start" })).status).toBe(401);
    expect((await track({ type: "level_up" })).status).toBe(400);
    expect((await track({ type: "quiz_submitted" })).status).toBe(400);
  });

  it("measures days away from earlier activity, then from the session it just recorded", async () => {
    const now = new Date();
    const fiveDaysAgo = new Date(utcDateOnly(now).getTime() - 5 * DAY_MS);
    await prisma.appActivityDay.create({
      data: { userId: fx.learner.id, date: fiveDaysAgo, activeSeconds: 60, heartbeats: 1, firstActiveAt: fiveDaysAgo, lastActiveAt: new Date(fiveDaysAgo.getTime() + 3_600_000) },
    });

    const first = await track({ type: "session_start" });
    expect(first.status).toBe(200);
    expect(first.body.data.events).toEqual([
      expect.objectContaining({ type: "session_start", isNew: true, payload: { daysAway: expect.any(Number) } }),
    ]);
    expect(first.body.data.events[0].payload.daysAway).toBeGreaterThanOrEqual(4);

    const second = await track({ type: "session_start" });
    expect(second.body.data.events[0].payload).toEqual({ daysAway: 0 });

    const rows = await prisma.engagementEvent.findMany({ where: { userId: fx.learner.id, type: "session_start" } });
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ platform: "web", courseId: null, chapterId: null });
  });

  it("offers the chapter to pick up again after a long time away", async () => {
    await prisma.engagementEvent.deleteMany({ where: { userId: fx.learner.id } });
    await prisma.appActivityDay.deleteMany({ where: { userId: fx.learner.id } });
    const longAgo = new Date(utcDateOnly(new Date()).getTime() - 20 * DAY_MS);
    await prisma.appActivityDay.create({
      data: { userId: fx.learner.id, date: longAgo, activeSeconds: 60, heartbeats: 1, firstActiveAt: longAgo, lastActiveAt: longAgo },
    });

    const back = await track({ type: "session_start" });
    expect(back.body.data.events[0].payload).toEqual({
      daysAway: expect.any(Number),
      resume: { href: `/courses/${fx.course.slug}/chapter-a`, chapterTitle: "Chapter A" },
    });
    expect(back.body.data.events[0].payload.daysAway).toBeGreaterThanOrEqual(19);
    // A short time away carries no resume point.
    expect((await track({ type: "session_start" })).body.data.events[0].payload).toEqual({ daysAway: 0 });
  });

  it("records a long study session once a day, only when today's activity shows it", async () => {
    const refused = await track({ type: "long_session" });
    expect(refused.status).toBe(409);

    const today = utcDateOnly(new Date());
    await prisma.appActivityDay.upsert({
      where: { userId_date: { userId: fx.learner.id, date: today } },
      create: { userId: fx.learner.id, date: today, activeSeconds: 45 * 60, heartbeats: 45, firstActiveAt: new Date(), lastActiveAt: new Date() },
      update: { activeSeconds: 45 * 60 },
    });
    const first = await track({ type: "long_session" });
    expect(first.body.data.events).toEqual([expect.objectContaining({ type: "long_session", isNew: true })]);
    expect((await track({ type: "long_session" })).body.data.events[0].isNew).toBe(false);
  });

  it("offers help on an unfinished chapter once a day", async () => {
    const first = await track({ type: "chapter_lingering", chapterId: fx.chapterA.id });
    expect(first.body.data.events).toEqual([
      expect.objectContaining({ type: "chapter_lingering", isNew: true, courseId: fx.course.id, chapterId: fx.chapterA.id }),
    ]);
    expect((await track({ type: "chapter_lingering", chapterId: fx.chapterA.id })).body.data.events[0].isNew).toBe(false);
    expect((await track({ type: "chapter_lingering" })).status).toBe(400);
  });

  it("records an enrollment once and refuses one that does not exist", async () => {
    const first = await track({ type: "enrolled", courseId: fx.course.id });
    expect(first.body.data.events).toEqual([expect.objectContaining({ type: "enrolled", isNew: true, courseId: fx.course.id })]);

    const again = await track({ type: "enrolled", courseId: fx.course.id });
    expect(again.body.data.events[0]).toMatchObject({ isNew: false, id: first.body.data.events[0].id });

    const notEnrolled = await track({ type: "enrolled", courseId: fx.course.id }, { Authorization: `Bearer ${mentorToken}` });
    expect(notEnrolled.status).toBe(409);
    expect(notEnrolled.body.code).toBe("ENGAGEMENT_EVENT_NOT_VERIFIED");
  });

  it("only records a chapter completion the progress tables show", async () => {
    expect((await track({ type: "chapter_completed", chapterId: fx.chapterA.id })).status).toBe(409);

    await completeChapter(fx.enrollment.id, fx.chapterA.id);
    const done = await track({ type: "chapter_completed", chapterId: fx.chapterA.id });
    expect(done.status).toBe(200);
    expect(done.body.data.events).toEqual([
      expect.objectContaining({ type: "chapter_completed", isNew: true, courseId: fx.course.id, chapterId: fx.chapterA.id }),
    ]);

    // A finished chapter no longer offers help.
    expect((await track({ type: "chapter_lingering", chapterId: fx.chapterA.id })).status).toBe(409);
  });

  it("records notes for an enrolled learner", async () => {
    const saved = await track({ type: "notes_saved", chapterId: fx.chapterA.id, platform: "ios" });
    expect(saved.body.data.events[0]).toMatchObject({ type: "notes_saved", isNew: true });
    const again = await track({ type: "notes_saved", chapterId: fx.chapterA.id });
    expect(again.body.data.events[0].isNew).toBe(true);
    expect(await prisma.engagementEvent.count({ where: { userId: fx.learner.id, type: "notes_saved", platform: "ios" } })).toBe(1);
  });

  it("reads quiz facts from the database and reports the chapter and course it finished", async () => {
    expect((await track({ type: "quiz_submitted", chapterId: fx.chapterB.id })).status).toBe(409);

    expect((await submitQuiz("b")).status).toBe(200);
    const missed = await track({ type: "quiz_submitted", chapterId: fx.chapterB.id });
    expect(missed.body.data.events).toEqual([
      expect.objectContaining({ type: "quiz_submitted", isNew: true, payload: { passed: false, attempt: 1, score: 0 } }),
    ]);

    // Reporting the same attempt twice stores it once.
    const repeated = await track({ type: "quiz_submitted", chapterId: fx.chapterB.id });
    expect(repeated.body.data.events[0]).toMatchObject({ isNew: false, payload: { attempt: 1 } });

    expect((await submitQuiz("a")).status).toBe(200);
    expect((await markComplete(fx.chapterB.id)).status).toBe(204);
    const passed = await track({ type: "quiz_submitted", chapterId: fx.chapterB.id });
    expect(passed.body.data.events.map((event: { type: string; isNew: boolean }) => [event.type, event.isNew])).toEqual([
      ["quiz_submitted", true],
      ["chapter_completed", true],
      ["course_completed", true],
      // The course's XP (docs/14-gamification.mdx) carries this learner into level 2.
      ["level_up", true],
    ]);
    expect(passed.body.data.events[0].payload).toEqual({ passed: true, attempt: 2, score: 100 });

    const finished = await track({ type: "course_completed", courseId: fx.course.id });
    expect(finished.body.data.events[0]).toMatchObject({ type: "course_completed", isNew: false });
  });

  it("refuses a quiz event for a chapter that is not a quiz", async () => {
    const response = await track({ type: "quiz_submitted", chapterId: fx.chapterA.id });
    expect(response.status).toBe(409);
  });
});
