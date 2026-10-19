import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { createCourseFixture } from "../helpers/fixtures.js";

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;

beforeAll(async () => {
  fx = await createCourseFixture();
});
afterAll(async () => {
  await prisma.headingNote.deleteMany({ where: { chapterId: fx.chapterA.id } });
  await prisma.instructorAccessRequest.deleteMany({ where: { userId: fx.learner.id } });
  await fx.cleanup();
});

const auth = () => ({ Authorization: `Bearer ${fx.learnerToken}` });
const progress = () =>
  prisma.chapterProgress.findUnique({ where: { enrollmentId_chapterId: { enrollmentId: fx.enrollment.id, chapterId: fx.chapterA.id } } });

describe("chapter completion", () => {
  it("refuses locked chapters and incomplete checkpoints with stable codes", async () => {
    const locked = await request(app).post(`/api/v1/chapters/${fx.chapterB.id}/complete`).set(auth());
    expect(locked.status).toBe(403);
    expect(locked.body.code).toBe("CHAPTER_LOCKED");

    const incomplete = await request(app).post(`/api/v1/chapters/${fx.chapterA.id}/complete`).set(auth());
    expect(incomplete.status).toBe(409);
    expect(incomplete.body.code).toBe("CHECKPOINTS_INCOMPLETE");
  });

  it("completes the chapter once every checkpoint is satisfied and rolls up the enrollment", async () => {
    await request(app).post(`/api/v1/blocks/${fx.quizBlock.id}/respond`).set(auth()).send({ selected: ["a"] });
    await request(app).post(`/api/v1/blocks/${fx.mustReadBlock.id}/respond`).set(auth()).send({ complete: true });

    const res = await request(app).post(`/api/v1/chapters/${fx.chapterA.id}/complete`).set(auth());
    expect(res.status).toBe(204);
    expect((await progress())?.status).toBe("COMPLETED");
    const enrollment = await prisma.enrollment.findUniqueOrThrow({ where: { id: fx.enrollment.id } });
    expect(enrollment.chaptersCompleted).toBe(1);
  });
});

describe("learning log and notes", () => {
  it("merges checklist ticks and answers into one document", async () => {
    expect((await request(app).put(`/api/v1/chapters/${fx.chapterA.id}/checklist/item-1`).set(auth()).send({ checked: true })).status).toBe(204);
    const saved = await request(app).put(`/api/v1/chapters/${fx.chapterA.id}/learning-log`).set(auth()).send({ answers: { q1: "Because vendors ship separately." } });
    expect(saved.status).toBe(200);
    expect(saved.body.data.savedAt).toEqual(expect.any(String));

    const log = (await progress())?.learningLog as { checklist: Record<string, { checked: boolean }>; answers: Record<string, { text: string }> };
    expect(log.checklist["item-1"].checked).toBe(true);
    expect(log.answers.q1.text).toBe("Because vendors ship separately.");
  });

  it("stores, overwrites and clears heading notes", async () => {
    const put = await request(app).put(`/api/v1/chapters/${fx.chapterA.id}/notes/intro`).set(auth()).send({ body: "Remember this." });
    expect(put.body.data).toEqual({ deleted: false });
    await request(app).put(`/api/v1/chapters/${fx.chapterA.id}/notes/intro`).set(auth()).send({ body: "Updated." });
    expect(await prisma.headingNote.count({ where: { userId: fx.learner.id, chapterId: fx.chapterA.id } })).toBe(1);
    expect((await prisma.headingNote.findFirst({ where: { userId: fx.learner.id } }))?.body).toBe("Updated.");

    const cleared = await request(app).put(`/api/v1/chapters/${fx.chapterA.id}/notes/intro`).set(auth()).send({ body: "   " });
    expect(cleared.body.data).toEqual({ deleted: true });
    expect(await prisma.headingNote.count({ where: { userId: fx.learner.id } })).toBe(0);
  });
});

describe("profile and instructor access", () => {
  it("reads and updates the profile", async () => {
    const before = await request(app).get("/api/v1/learner/profile").set(auth());
    expect(before.body.data).toMatchObject({ email: fx.learner.email, timezone: "UTC", skills: [], featuredCourse: { title: fx.course.title } });

    const bad = await request(app).patch("/api/v1/learner/profile").set(auth()).send({ name: "", timezone: "UTC", skills: [] });
    expect(bad.status).toBe(400);
    expect(bad.body.errors[0]).toEqual({ field: "name", message: "Name is required" });

    expect((await request(app).patch("/api/v1/learner/profile").set(auth()).send({ name: "Ada L.", timezone: "Europe/Lisbon", skills: ["sql", "react"] })).status).toBe(204);
    const after = await request(app).get("/api/v1/learner/profile").set(auth());
    expect(after.body.data).toMatchObject({ name: "Ada L.", timezone: "Europe/Lisbon", skills: ["sql", "react"] });
  });

  it("records one pending instructor-access request per learner", async () => {
    const first = await request(app).post("/api/v1/learner/instructor-access-requests").set(auth()).send({ message: "I teach SQL." });
    expect(first.status).toBe(201);
    const again = await request(app).post("/api/v1/learner/instructor-access-requests").set(auth()).send({});
    expect(again.status).toBe(409);
    expect(again.body.code).toBe("REQUEST_PENDING");
    const workspace = await request(app).get("/api/v1/learner/workspace").set(auth());
    expect(workspace.body.data.instructorAccess).toEqual({ role: "MENTEE", requestStatus: "pending", canRequestAccess: false });
  });
});
