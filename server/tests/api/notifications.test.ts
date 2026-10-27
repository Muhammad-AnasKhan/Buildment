import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { createSession } from "../../src/services/auth/session.js";
import { notifyMentorHelpQuestion } from "../../src/services/notifications/events.js";
import { notify, relayUnpushedNotifications } from "../../src/services/notifications/service.js";
import { recomputeEnrollmentRollup } from "../../src/services/progress/compute.js";
import { setRealtimeEmitter } from "../../src/services/notifications/realtime.js";
import { createCourseFixture } from "../helpers/fixtures.js";

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;
let mentorToken = "";
let threadId = "";

beforeAll(async () => {
  fx = await createCourseFixture();
  mentorToken = (await createSession(fx.mentor.id)).sessionToken;
});
afterAll(async () => {
  await prisma.helpMessage.deleteMany({ where: { thread: { courseId: fx.course.id } } });
  await prisma.helpThread.deleteMany({ where: { courseId: fx.course.id } });
  await fx.cleanup();
});

const learner = () => ({ Authorization: `Bearer ${fx.learnerToken}` });
const mentor = () => ({ Authorization: `Bearer ${mentorToken}` });

describe("/api/v1/notifications", () => {
  it("requires a session", async () => {
    expect((await request(app).get("/api/v1/notifications")).status).toBe(401);
  });

  it("notifies the mentor in-app and queues email when a learner asks a question", async () => {
    const asked = await request(app)
      .post("/api/v1/help/threads")
      .set(learner())
      .send({ courseId: fx.course.id, chapterId: fx.chapterA.id, body: "What does the second option mean?" });
    expect(asked.status).toBe(201);
    threadId = asked.body.data.threadId;

    const feed = await request(app).get("/api/v1/notifications").set(mentor());
    expect(feed.status).toBe(200);
    expect(feed.body.data.unreadCount).toBe(1);
    expect(feed.body.data.items).toHaveLength(1);
    expect(feed.body.data.items[0]).toMatchObject({
      type: "help.question",
      category: "activity",
      title: "Test Learner asked a question",
      url: `/help/${threadId}`,
      courseId: fx.course.id,
      readAt: null,
    });

    // The email waits in the outbox for the worker; nothing was sent inside the request.
    const emails = await prisma.emailOutbox.findMany({ where: { userId: fx.mentor.id } });
    expect(emails).toHaveLength(1);
    expect(emails[0]).toMatchObject({ status: "PENDING", toEmail: fx.mentor.email, type: "help.question", attempts: 0 });
    expect(emails[0]!.html).toContain("/notifications");

    // The learner's own feed stays empty.
    expect((await request(app).get("/api/v1/notifications").set(learner())).body.data.items).toEqual([]);
  });

  it("never notifies twice for the same event", async () => {
    const message = await prisma.helpMessage.findFirstOrThrow({ where: { threadId }, orderBy: { createdAt: "asc" } });
    await notifyMentorHelpQuestion({ threadId, messageId: message.id, body: message.body, menteeName: "Test Learner" });
    await notifyMentorHelpQuestion({ threadId, messageId: message.id, body: message.body, menteeName: "Test Learner" });

    expect(await prisma.notification.count({ where: { userId: fx.mentor.id } })).toBe(1);
    expect(await prisma.emailOutbox.count({ where: { userId: fx.mentor.id } })).toBe(1);
  });

  it("lets only the owner mark a notification read, and keeps the unread count in step", async () => {
    const [mine] = (await request(app).get("/api/v1/notifications").set(mentor())).body.data.items;

    const stranger = await request(app).post(`/api/v1/notifications/${mine.id}/read`).set(learner());
    expect(stranger.status).toBe(404);

    const read = await request(app).post(`/api/v1/notifications/${mine.id}/read`).set(mentor());
    expect(read.body.data).toEqual({ unreadCount: 0 });
    const again = await request(app).post(`/api/v1/notifications/${mine.id}/read`).set(mentor());
    expect(again.body.data).toEqual({ unreadCount: 0 });

    const unread = await request(app).get("/api/v1/notifications?unreadOnly=true").set(mentor());
    expect(unread.body.data.items).toEqual([]);
  });

  it("delivers the mentor's reply to the learner, filtered by their preferences", async () => {
    const defaults = await request(app).get("/api/v1/notifications/preferences").set(learner());
    expect(defaults.body.data.email).toMatchObject({ activity: true, reminder: true, account: true });

    // Account notices cannot be switched off; the request still saves the rest.
    const saved = await request(app)
      .put("/api/v1/notifications/preferences")
      .set(learner())
      .send({ email: { activity: false, account: false } });
    expect(saved.status).toBe(200);
    expect(saved.body.data.email).toMatchObject({ activity: false, account: true });
    expect(saved.body.data.inApp.activity).toBe(true);

    const bad = await request(app).put("/api/v1/notifications/preferences").set(learner()).send({ email: { nope: false } });
    expect(bad.status).toBe(400);

    await request(app).post(`/api/v1/help/threads/${threadId}/messages`).set(mentor()).send({ body: "It means the vendor pays." });

    const feed = await request(app).get("/api/v1/notifications").set(learner());
    expect(feed.body.data.items[0]).toMatchObject({ type: "help.reply", url: `/my-questions/${threadId}` });
    expect(await prisma.emailOutbox.count({ where: { userId: fx.learner.id } })).toBe(0);
  });

  it("pages through the feed newest first and marks everything read", async () => {
    for (const n of [1, 2, 3]) {
      await notify({
        type: "enrollment.created",
        recipients: [{ userId: fx.learner.id }],
        dedupeKey: `test-page-${fx.tag}-${n}`,
        title: `Item ${n}`,
        body: "",
      });
    }

    const first = await request(app).get("/api/v1/notifications?limit=2").set(learner());
    expect(first.body.data.items.map((i: { title: string }) => i.title)).toEqual(["Item 3", "Item 2"]);
    expect(first.body.data.nextCursor).toBeTruthy();

    const second = await request(app).get(`/api/v1/notifications?limit=2&cursor=${first.body.data.nextCursor}`).set(learner());
    expect(second.body.data.items.map((i: { title: string }) => i.title)).toEqual(["Item 1", expect.stringContaining("replied")]);
    expect(second.body.data.nextCursor).toBeNull();

    const all = await request(app).post("/api/v1/notifications/read-all").set(learner());
    expect(all.body.data).toEqual({ unreadCount: 0 });
    expect((await request(app).get("/api/v1/notifications").set(learner())).body.data.unreadCount).toBe(0);
  });

  it("writes course completion inside the completing transaction and pushes it after commit", async () => {
    const pushed: { userId: string; event: string }[] = [];
    setRealtimeEmitter((userId, event) => pushed.push({ userId, event }));
    try {
      for (const chapter of [fx.chapterA, fx.chapterB]) {
        await prisma.chapterProgress.upsert({
          where: { enrollmentId_chapterId: { enrollmentId: fx.enrollment.id, chapterId: chapter.id } },
          create: { enrollmentId: fx.enrollment.id, chapterId: chapter.id, status: "COMPLETED", completedAt: new Date() },
          update: { status: "COMPLETED", completedAt: new Date() },
        });
      }
      await prisma.$transaction((tx) => recomputeEnrollmentRollup(tx, fx.enrollment.id));
      await prisma.$transaction((tx) => recomputeEnrollmentRollup(tx, fx.enrollment.id));

      const completed = await prisma.notification.findMany({ where: { userId: fx.learner.id, type: "course.completed" } });
      expect(completed).toHaveLength(1);
      expect(completed[0]!.pushedAt).toBeNull();
      const toMentor = await prisma.notification.findMany({ where: { userId: fx.mentor.id, type: "course.learner_completed" } });
      expect(toMentor).toHaveLength(1);
      // The mentor's copy is in-app only.
      expect(await prisma.emailOutbox.count({ where: { userId: fx.mentor.id, type: "course.learner_completed" } })).toBe(0);

      expect(await relayUnpushedNotifications()).toBeGreaterThanOrEqual(2);
      expect(pushed).toEqual(
        expect.arrayContaining([
          { userId: fx.learner.id, event: "notification:new" },
          { userId: fx.mentor.id, event: "notification:new" },
        ])
      );
      expect((await prisma.notification.findUniqueOrThrow({ where: { id: completed[0]!.id } })).pushedAt).not.toBeNull();
    } finally {
      setRealtimeEmitter(null);
    }
  });
});
