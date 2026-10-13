import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { createSession } from "../../src/services/auth/session.js";
import { createCourseFixture } from "../helpers/fixtures.js";

// Mentor help inbox on top of the shared help threads: filters, counts and the
// mentee details the thread page needs.

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;
let mentorToken = "";
let threadId = "";

beforeAll(async () => {
  fx = await createCourseFixture();
  mentorToken = (await createSession(fx.mentor.id)).sessionToken;
  const asked = await request(app)
    .post("/api/v1/help/threads")
    .set("Authorization", `Bearer ${fx.learnerToken}`)
    .send({ courseId: fx.course.id, chapterId: fx.chapterA.id, body: "What does the second option mean exactly?" });
  expect(asked.status).toBe(201);
  threadId = asked.body.data.threadId;
});

afterAll(async () => {
  await prisma.helpMessage.deleteMany({ where: { thread: { courseId: fx.course.id } } });
  await prisma.helpThread.deleteMany({ where: { courseId: fx.course.id } });
  await fx.cleanup();
});

const mentor = () => ({ Authorization: `Bearer ${mentorToken}` });

describe("GET /api/v1/teach/help/threads", () => {
  it("lists open questions across the mentor's courses with the open count", async () => {
    const res = await request(app).get("/api/v1/teach/help/threads").set(mentor());
    expect(res.status).toBe(200);
    expect(res.body.data.courses.map((c: { id: string }) => c.id)).toContain(fx.course.id);
    expect(res.body.data.openCount).toBeGreaterThanOrEqual(1);
    const thread = res.body.data.threads.find((t: { id: string }) => t.id === threadId);
    expect(thread).toMatchObject({ status: "OPEN", menteeLabel: "Test Learner", courseTitle: fx.course.title, chapterTitle: "Chapter A" });
    expect(thread.preview.body).toMatch(/second option/);
    expect(thread.ageHours).toBeGreaterThanOrEqual(0);
  });

  it("filters by course and status and rejects unknown status values", async () => {
    const resolved = await request(app).get(`/api/v1/teach/help/threads?status=resolved&courseId=${fx.course.id}`).set(mentor());
    expect(resolved.status).toBe(200);
    expect(resolved.body.data.threads.map((t: { id: string }) => t.id)).not.toContain(threadId);

    const all = await request(app).get(`/api/v1/teach/help/threads?status=all&courseId=${fx.course.id}`).set(mentor());
    expect(all.body.data.threads.map((t: { id: string }) => t.id)).toContain(threadId);

    expect((await request(app).get("/api/v1/teach/help/threads?status=weird").set(mentor())).status).toBe(400);
    expect((await request(app).get("/api/v1/teach/help/threads").set("Authorization", `Bearer ${fx.learnerToken}`)).status).toBe(403);
  });

  it("exposes the mentee on the shared thread detail for the mentor page", async () => {
    const res = await request(app).get(`/api/v1/help/threads/${threadId}`).set(mentor());
    expect(res.status).toBe(200);
    expect(res.body.data.mentee).toEqual({ id: fx.learner.id, name: "Test Learner", email: fx.learner.email });
    expect(res.body.data.course.title).toBe(fx.course.title);
    expect(res.body.data.chapter.title).toBe("Chapter A");
  });
});
