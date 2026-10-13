import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { createSession } from "../../src/services/auth/session.js";
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

describe("/api/v1/help", () => {
  it("starts empty and validates the question length", async () => {
    const list = await request(app).get("/api/v1/help/threads").set(learner());
    expect(list.body.data.threads).toEqual([]);

    const short = await request(app).post("/api/v1/help/threads").set(learner()).send({ courseId: fx.course.id, chapterId: fx.chapterA.id, body: "help" });
    expect(short.status).toBe(400);
    expect(short.body.message).toMatch(/at least 10 characters/);
  });

  it("refuses questions on locked chapters", async () => {
    const res = await request(app).post("/api/v1/help/threads").set(learner()).send({ courseId: fx.course.id, chapterId: fx.chapterB.id, body: "I am stuck on this quiz chapter." });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("CHAPTER_LOCKED");
  });

  it("creates a thread, then appends to the open one for the same chapter", async () => {
    const first = await request(app).post("/api/v1/help/threads").set(learner()).send({ courseId: fx.course.id, chapterId: fx.chapterA.id, body: "What does the second option mean exactly?" });
    expect(first.status).toBe(201);
    threadId = first.body.data.threadId;

    const second = await request(app).post("/api/v1/help/threads").set(learner()).send({ courseId: fx.course.id, chapterId: fx.chapterA.id, body: "Also, is there a reading I should do first?" });
    expect(second.status).toBe(200);
    expect(second.body.data).toEqual({ threadId, created: false });

    const list = await request(app).get("/api/v1/help/threads").set(learner());
    expect(list.body.data.threads).toHaveLength(1);
    expect(list.body.data.threads[0]).toMatchObject({ id: threadId, status: "OPEN", unread: false, chapter: { slug: "chapter-a" } });
  });

  it("lets the course mentor read and reply, and flags the reply unread for the learner", async () => {
    const stranger = await request(app).get(`/api/v1/help/threads/${threadId}`).set({ Authorization: `Bearer ${fx.unverifiedToken}` });
    expect(stranger.status).toBe(403);

    const reply = await request(app).post(`/api/v1/help/threads/${threadId}/messages`).set(mentor()).send({ body: "It means the vendor pays the fee, not the buyer." });
    expect(reply.status).toBe(201);

    const list = await request(app).get("/api/v1/help/threads").set(learner());
    expect(list.body.data.threads[0].unread).toBe(true);

    const detail = await request(app).get(`/api/v1/help/threads/${threadId}`).set(learner());
    expect(detail.body.data.messages.map((m: { authorRole: string }) => m.authorRole)).toEqual(["MENTEE", "MENTEE", "MENTOR"]);
    expect(detail.body.data.course.slug).toBe(fx.course.slug);

    const after = await request(app).get("/api/v1/help/threads").set(learner());
    expect(after.body.data.threads[0].unread).toBe(false);
  });

  it("only the mentor resolves, and a resolved thread rejects replies", async () => {
    const denied = await request(app).post(`/api/v1/help/threads/${threadId}/resolve`).set(learner());
    expect(denied.status).toBe(403);

    const resolved = await request(app).post(`/api/v1/help/threads/${threadId}/resolve`).set(mentor());
    expect(resolved.body.data).toEqual({ threadId, alreadyResolved: false });

    const closed = await request(app).post(`/api/v1/help/threads/${threadId}/messages`).set(learner()).send({ body: "One more thing I wanted to ask." });
    expect(closed.status).toBe(409);
    expect(closed.body.code).toBe("THREAD_CLOSED");
  });
});
