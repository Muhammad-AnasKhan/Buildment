import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { createSession } from "../../src/services/auth/session.js";
import { createCourseFixture } from "../helpers/fixtures.js";

// Instructor workspace: course lifecycle, curriculum builder and chapter editor.
// The fixture's published course is read-only here; mutations run on a course the
// test creates through the API and deletes afterwards.

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;
let mentorToken = "";
let strangerToken = "";
let strangerId = "";
let createdCourseId = "";
let createdCourseSlug = "";

beforeAll(async () => {
  fx = await createCourseFixture();
  mentorToken = (await createSession(fx.mentor.id)).sessionToken;
  const stranger = await prisma.user.create({
    data: { email: `other-mentor-${fx.course.id}@test.local`, name: "Other Mentor", role: "MENTOR", emailVerified: new Date() },
  });
  strangerId = stranger.id;
  strangerToken = (await createSession(stranger.id)).sessionToken;
});

afterAll(async () => {
  if (createdCourseId) await prisma.course.delete({ where: { id: createdCourseId } }).catch(() => undefined);
  await prisma.session.deleteMany({ where: { userId: strangerId } });
  await prisma.user.delete({ where: { id: strangerId } });
  await fx.cleanup();
});

const mentor = () => ({ Authorization: `Bearer ${mentorToken}` });
const stranger = () => ({ Authorization: `Bearer ${strangerToken}` });
const learner = () => ({ Authorization: `Bearer ${fx.learnerToken}` });

describe("/api/v1/teach access", () => {
  it("requires a signed-in instructor", async () => {
    expect((await request(app).get("/api/v1/teach/workspace")).status).toBe(401);
    const res = await request(app).get("/api/v1/teach/workspace").set(learner());
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("INSTRUCTOR_REQUIRED");
  });

  it("lists only the caller's courses in the workspace and course list", async () => {
    const ws = await request(app).get("/api/v1/teach/workspace").set(mentor());
    expect(ws.status).toBe(200);
    expect(ws.body.data.instructorAccess.role).toBe("MENTOR");
    expect(ws.body.data.courses.map((c: { id: string }) => c.id)).toContain(fx.course.id);

    const list = await request(app).get("/api/v1/teach/courses").set(mentor());
    const card = list.body.data.courses.find((c: { id: string }) => c.id === fx.course.id);
    expect(card).toMatchObject({ slug: fx.course.slug, status: "PUBLISHED", chapterCount: 2, learnerCount: 1 });
    expect(list.body.data.summary.totalCourses).toBeGreaterThanOrEqual(1);

    const other = await request(app).get("/api/v1/teach/workspace").set(stranger());
    expect(other.body.data.courses.map((c: { id: string }) => c.id)).not.toContain(fx.course.id);
  });

  it("refuses another mentor's course with 403 and unknown courses with 404", async () => {
    const forbidden = await request(app).get(`/api/v1/teach/courses/${fx.course.slug}/builder`).set(stranger());
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.code).toBe("NOT_COURSE_MENTOR");
    expect((await request(app).get("/api/v1/teach/courses/nope/builder").set(mentor())).status).toBe(404);
  });
});

describe("course lifecycle", () => {
  it("creates a draft course with a default module and a unique slug", async () => {
    const res = await request(app).post("/api/v1/teach/courses").set(mentor()).send({ title: `Test course ${fx.course.id}` });
    expect(res.status).toBe(201);
    createdCourseSlug = res.body.data.courseSlug;
    expect(createdCourseSlug).toMatch(/^test-course-/);
    expect(createdCourseSlug).not.toBe(fx.course.slug);

    const builder = await request(app).get(`/api/v1/teach/courses/${createdCourseSlug}/builder`).set(mentor());
    expect(builder.status).toBe(200);
    createdCourseId = builder.body.data.course.id;
    expect(builder.body.data.course).toMatchObject({ status: "DRAFT", enrollmentCount: 0, pricingType: "FREE" });
    expect(builder.body.data.course.modules).toHaveLength(1);
    expect(builder.body.data.course.modules[0].title).toBe("Part 1");
    expect(builder.body.data.looseChapters).toEqual([]);
  });

  it("validates the title", async () => {
    const res = await request(app).post("/api/v1/teach/courses").set(mentor()).send({ title: "ab" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("will not publish an empty course and explains why", async () => {
    const res = await request(app).post(`/api/v1/teach/courses/${createdCourseId}/publish`).set(mentor());
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("COURSE_NOT_PUBLISHABLE");
    expect(res.body.errors.map((e: { message: string }) => e.message)).toEqual([
      "Add at least one chapter before publishing.",
      "Publish at least one chapter before publishing the course.",
    ]);
  });

  it("updates settings and rejects paid courses without a price", async () => {
    const base = {
      title: "Renamed course",
      description: "About it",
      coverUrl: "",
      projectGoal: "Build X",
      difficulty: "Medium",
      estimatedHours: "12",
      sequential: false,
      currency: "usd",
    };
    const paid = await request(app).patch(`/api/v1/teach/courses/${createdCourseId}/settings`).set(mentor()).send({ ...base, pricingType: "PAID", priceDollars: "" });
    expect(paid.status).toBe(422);

    const ok = await request(app).patch(`/api/v1/teach/courses/${createdCourseId}/settings`).set(mentor()).send({ ...base, pricingType: "PAID", priceDollars: "19.5" });
    expect(ok.status).toBe(204);
    const row = await prisma.course.findUniqueOrThrow({ where: { id: createdCourseId } });
    expect(row).toMatchObject({ title: "Renamed course", difficulty: "Medium", estimatedHours: 12, sequential: false, priceCents: 1950, currency: "USD" });

    const free = await request(app).patch(`/api/v1/teach/courses/${createdCourseId}/settings`).set(mentor()).send({ ...base, pricingType: "FREE", priceDollars: "", difficulty: "", estimatedHours: "" });
    expect(free.status).toBe(204);
  });
});

describe("modules", () => {
  let moduleId = "";
  let firstModuleId = "";

  it("creates, renames and moves modules; refuses to move past the edge", async () => {
    const builder = await request(app).get(`/api/v1/teach/courses/${createdCourseSlug}/builder`).set(mentor());
    firstModuleId = builder.body.data.course.modules[0].id;

    const createdModule = await request(app).post(`/api/v1/teach/courses/${createdCourseId}/modules`).set(mentor()).send({ title: "Part 2" });
    expect(createdModule.status).toBe(201);
    moduleId = createdModule.body.data.moduleId;

    expect((await request(app).patch(`/api/v1/teach/modules/${moduleId}`).set(mentor()).send({ title: "Advanced" })).status).toBe(204);
    expect((await request(app).post(`/api/v1/teach/modules/${moduleId}/move`).set(mentor()).send({ direction: "up" })).status).toBe(204);

    const after = await request(app).get(`/api/v1/teach/courses/${createdCourseSlug}/builder`).set(mentor());
    expect(after.body.data.course.modules.map((m: { title: string }) => m.title)).toEqual(["Advanced", "Part 1"]);

    const edge = await request(app).post(`/api/v1/teach/modules/${moduleId}/move`).set(mentor()).send({ direction: "up" });
    expect(edge.status).toBe(409);
    expect(edge.body.code).toBe("ALREADY_AT_EDGE");

    expect((await request(app).patch(`/api/v1/teach/modules/${firstModuleId}`).set(stranger()).send({ title: "x" })).status).toBe(403);
  });
});

describe("chapters", () => {
  let chapterId = "";
  let secondChapterId = "";

  it("creates chapters inside a module with incrementing order and unique slugs", async () => {
    const builder = await request(app).get(`/api/v1/teach/courses/${createdCourseSlug}/builder`).set(mentor());
    const moduleId = builder.body.data.course.modules[0].id;

    const first = await request(app).post(`/api/v1/teach/courses/${createdCourseId}/chapters`).set(mentor()).send({ moduleId, title: "Intro" });
    expect(first.status).toBe(201);
    chapterId = first.body.data.chapterId;
    const second = await request(app).post(`/api/v1/teach/courses/${createdCourseId}/chapters`).set(mentor()).send({ moduleId, title: "Intro" });
    secondChapterId = second.body.data.chapterId;

    const rows = await prisma.chapter.findMany({ where: { courseId: createdCourseId }, orderBy: { order: "asc" } });
    expect(rows.map((r) => [r.slug, r.order])).toEqual([["intro", 1], ["intro-2", 2]]);

    const missingModule = await request(app).post(`/api/v1/teach/courses/${createdCourseId}/chapters`).set(mentor()).send({ moduleId: "nope", title: "X" });
    expect(missingModule.status).toBe(404);
  });

  it("moves chapters and reports the edge", async () => {
    expect((await request(app).post(`/api/v1/teach/chapters/${secondChapterId}/move`).set(mentor()).send({ direction: "up" })).status).toBe(204);
    const rows = await prisma.chapter.findMany({ where: { courseId: createdCourseId }, orderBy: { order: "asc" } });
    expect(rows.map((r) => r.id)).toEqual([secondChapterId, chapterId]);
    expect((await request(app).post(`/api/v1/teach/chapters/${secondChapterId}/move`).set(mentor()).send({ direction: "up" })).status).toBe(409);
  });

  it("serves the editor view and saves settings", async () => {
    const editor = await request(app).get(`/api/v1/teach/chapters/${chapterId}/editor`).set(mentor());
    expect(editor.status).toBe(200);
    expect(editor.body.data).toMatchObject({ chapterId, courseSlug: createdCourseSlug, title: "Intro", publishedAt: null, hasUnpublishedChanges: false, source: "# Intro\n", blockConfigs: {} });

    const settings = await request(app).patch(`/api/v1/teach/chapters/${chapterId}/settings`).set(mentor()).send({ title: "  Intro to X  ", summary: "", estimatedMinutes: 25, readerMode: "QUIZ", isMilestone: true });
    expect(settings.status).toBe(200);
    expect(settings.body.data.savedAt).toMatch(/T/);
    const row = await prisma.chapter.findUniqueOrThrow({ where: { id: chapterId } });
    expect(row).toMatchObject({ title: "Intro to X", summary: null, estimatedMinutes: 25, readerMode: "QUIZ", isMilestone: true });

    expect((await request(app).get(`/api/v1/teach/chapters/${chapterId}/editor`).set(stranger())).status).toBe(403);
    expect((await request(app).get("/api/v1/teach/chapters/nope/editor").set(mentor())).status).toBe(404);
  });

  it("syncs blocks from the draft and refuses to publish an invalid one", async () => {
    const draft = [
      "# Intro",
      "",
      '<Quiz id="q-1" prompt="2 + 2?" options={[{"id":"a","label":"4"},{"id":"b","label":"5"}]} correctOptionIds={["a"]} />',
      "",
      '<OpenQuestion id="oq-1" />',
      "",
      "<Mystery />",
    ].join("\n");
    const saved = await request(app).put(`/api/v1/teach/chapters/${chapterId}/draft`).set(mentor()).send({ source: draft });
    expect(saved.status).toBe(200);

    const blocks = await prisma.block.findMany({ where: { chapterId, archivedAt: null }, orderBy: { order: "asc" } });
    expect(blocks.map((b) => [b.id, b.type])).toEqual([["q-1", "QUIZ"], ["oq-1", "OPEN_QUESTION"]]);
    expect((blocks[0]!.config as { correctOptionIds: string[] }).correctOptionIds).toEqual(["a"]);

    const publish = await request(app).post(`/api/v1/teach/chapters/${chapterId}/publish`).set(mentor());
    expect(publish.status).toBe(422);
    expect(publish.body.code).toBe("CHAPTER_NOT_PUBLISHABLE");
    const reasons = publish.body.errors.map((e: { message: string }) => e.message).join("\n");
    expect(reasons).toMatch(/Unknown component <Mystery>/);
    expect(reasons).toMatch(/oq-1/);
  });

  it("publishes a valid draft, snapshots it and archives blocks removed from the source", async () => {
    const draft = ['<Quiz id="q-1" prompt="2 + 2?" options={[{"id":"a","label":"4"},{"id":"b","label":"5"}]} correctOptionIds={["a"]} />'].join("\n");
    await request(app).put(`/api/v1/teach/chapters/${chapterId}/draft`).set(mentor()).send({ source: draft });

    const publish = await request(app).post(`/api/v1/teach/chapters/${chapterId}/publish`).set(mentor());
    expect(publish.status).toBe(204);

    const row = await prisma.chapter.findUniqueOrThrow({ where: { id: chapterId }, include: { blocks: true } });
    expect(row.publishedAt).not.toBeNull();
    expect(row.compiled).toBe(draft);
    expect(row.blocks.find((b) => b.id === "oq-1")?.archivedAt).not.toBeNull();
    expect(row.blocks.find((b) => b.id === "q-1")?.archivedAt).toBeNull();

    const editor = await request(app).get(`/api/v1/teach/chapters/${chapterId}/editor`).set(mentor());
    expect(editor.body.data.hasUnpublishedChanges).toBe(false);
    expect(Object.keys(editor.body.data.blockConfigs)).toEqual(["q-1"]);
  });

  it("publishes the course once a chapter is live, then archives or drafts it on unpublish", async () => {
    const publish = await request(app).post(`/api/v1/teach/courses/${createdCourseId}/publish`).set(mentor());
    expect(publish.status).toBe(200);
    expect(publish.body.data.courseSlug).toBe(createdCourseSlug);

    const unpublish = await request(app).post(`/api/v1/teach/courses/${createdCourseId}/unpublish`).set(mentor()).send({});
    expect(unpublish.status).toBe(200);
    expect((await prisma.course.findUniqueOrThrow({ where: { id: createdCourseId } })).status).toBe("DRAFT");

    const restore = await request(app).post(`/api/v1/teach/courses/${createdCourseId}/restore`).set(mentor());
    expect(restore.status).toBe(200);
  });

  it("asks for confirmation before archiving a course with learners", async () => {
    const res = await request(app).post(`/api/v1/teach/courses/${fx.course.id}/unpublish`).set(mentor()).send({});
    expect(res.status).toBe(409);
    expect(res.body.code).toBe("ENROLLMENTS_CONFIRMATION_REQUIRED");
  });
});

describe("deletion", () => {
  it("removes a chapter and its content", async () => {
    const created = await request(app)
      .post(`/api/v1/teach/courses/${createdCourseId}/chapters`)
      .set(mentor())
      .send({ title: "Temporary" });
    expect(created.status).toBe(201);
    const temporaryId = created.body.data.chapterId;

    expect((await request(app).delete(`/api/v1/teach/chapters/${temporaryId}`).set(stranger()).send({})).status).toBe(403);
    expect((await request(app).delete(`/api/v1/teach/chapters/${temporaryId}`).set(mentor()).send({})).status).toBe(204);
    expect(await prisma.chapter.findUnique({ where: { id: temporaryId } })).toBeNull();
  });

  it("requires explicit confirmation and enrollment acknowledgement to delete a course", async () => {
    // The schema requires `confirm: true`, so a bare call is rejected.
    expect((await request(app).delete(`/api/v1/teach/courses/${createdCourseId}`).set(mentor()).send({})).status).toBe(400);

    const noAck = await request(app).delete(`/api/v1/teach/courses/${fx.course.id}`).set(mentor()).send({ confirm: true });
    expect(noAck.status).toBe(409);
    expect(noAck.body.code).toBe("ENROLLMENTS_CONFIRMATION_REQUIRED");

    expect((await request(app).delete(`/api/v1/teach/courses/${fx.course.id}`).set(stranger()).send({ confirm: true, confirmedWithEnrollments: true })).status).toBe(403);
  });

  it("deletes a draft course after confirmation", async () => {
    const res = await request(app).delete(`/api/v1/teach/courses/${createdCourseId}`).set(mentor()).send({ confirm: true });
    expect(res.status).toBe(200);
    expect(res.body.data.courseSlug).toBe(createdCourseSlug);
    expect(await prisma.course.findUnique({ where: { id: createdCourseId } })).toBeNull();
    createdCourseId = "";
  });
});
