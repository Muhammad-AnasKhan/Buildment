import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../src/db/prisma.js";
import { createApp } from "../../src/app.js";
import { createSession } from "../../src/services/auth/session.js";
import { parseCourseZip, type ImportPlan } from "../../src/services/teach/course-import.js";
import { loadCourseBuilder } from "../../src/services/teach/courses.js";
import { loadCourseGate } from "../../src/services/progress/gate.js";
import type { CourseUpdatePreview } from "../../src/shared/api/teach.js";

// Parsing/ZIP boundaries have separate tests; use deterministic plans to exercise actual API/DB updates.
vi.mock("../../src/services/teach/course-import.js", async importOriginal => ({
  ...await importOriginal<typeof import("../../src/services/teach/course-import.js")>(), parseCourseZip: vi.fn(),
}));

const app = createApp();
const paymentText = "Validate checkout inputs before charging the customer. Check the basket total and reject expired payment tokens. Save the transaction safely and send a receipt to the customer.";
const deploymentText = "Deploy the application using production environment variables. Configure the server health check and database connection. Run migrations before accepting requests from users.";
const lesson = (title: string, source: string, blocks: ImportPlan["modules"][number]["lessons"][number]["blocks"] = []) => ({
  title, source, blocks, lessonNum: 1, slugPart: "lesson", summary: null, estimatedMinutes: 10,
  readerMode: "DEFAULT" as const, isMilestone: false,
});
const plan = (modules: ImportPlan["modules"]): ImportPlan => ({ manifest: { title: "Incoming title", description: "Incoming", projectGoal: "Incoming", difficulty: "beginner", estimatedHours: 1 }, modules });
let owner: Awaited<ReturnType<typeof prisma.user.create>>;
let stranger: typeof owner;
let learner: typeof owner;
let course: Awaited<ReturnType<typeof prisma.course.create>>;
let moduleA: Awaited<ReturnType<typeof prisma.module.create>>;
let moduleB: typeof moduleA;
let payments: Awaited<ReturnType<typeof prisma.chapter.create>>;
let deployment: typeof payments;
let enrollment: Awaited<ReturnType<typeof prisma.enrollment.create>>;
let token = "", strangerToken = "", blockId = "", responseId = "";
let currentPlan: ImportPlan;
const headers = () => ({ Authorization: `Bearer ${token}` });
const endpoint = () => `/api/v1/teach/courses/${course.id}/import`;

beforeEach(async () => {
  const tag = randomUUID();
  owner = await prisma.user.create({ data: { email: `zip-owner-${tag}@test.local`, role: "MENTOR", emailVerified: new Date(), zipImportEnabled: true } });
  stranger = await prisma.user.create({ data: { email: `zip-stranger-${tag}@test.local`, role: "MENTOR", emailVerified: new Date(), zipImportEnabled: true } });
  learner = await prisma.user.create({ data: { email: `zip-learner-${tag}@test.local`, role: "MENTEE", emailVerified: new Date() } });
  course = await prisma.course.create({ data: { slug: `zip-update-${tag}`, title: "Original title", mentorId: owner.id, status: "PUBLISHED", publishedAt: new Date() } });
  moduleA = await prisma.module.create({ data: { courseId: course.id, title: "Checkout", order: 1 } });
  moduleB = await prisma.module.create({ data: { courseId: course.id, title: "Operations", order: 2 } });
  payments = await prisma.chapter.create({ data: { courseId: course.id, moduleId: moduleA.id, title: "Payments", slug: "payments", source: paymentText, compiled: paymentText, order: 1, publishedAt: new Date(), estimatedMinutes: 10 } });
  deployment = await prisma.chapter.create({ data: { courseId: course.id, moduleId: moduleB.id, title: "Deployment", slug: "deployment", source: deploymentText, compiled: deploymentText, order: 1, publishedAt: new Date(), estimatedMinutes: 10 } });
  enrollment = await prisma.enrollment.create({ data: { courseId: course.id, userId: learner.id, lifecycle: "ACTIVE", status: "COMPLETED", percentComplete: 100, chaptersCompleted: 2, lastActiveAt: new Date("2026-01-01"), completedAt: new Date("2026-01-02") } });
  for (const chapter of [payments, deployment]) await prisma.chapterProgress.create({ data: { enrollmentId: enrollment.id, chapterId: chapter.id, status: "COMPLETED", timeSpentSeconds: 123, startedAt: new Date("2026-01-01"), completedAt: new Date("2026-01-02"), learningLog: { notes: "Keep my notes" } } });
  blockId = `original-${tag}`;
  await prisma.block.create({ data: { id: blockId, chapterId: payments.id, type: "OPEN_QUESTION", order: 1, config: { prompt: "Explain checkout safety" } } });
  responseId = (await prisma.response.create({ data: { blockId, userId: learner.id, enrollmentId: enrollment.id, payload: { answer: "My submission" }, status: "SUBMITTED" } })).id;
  token = (await createSession(owner.id)).sessionToken;
  strangerToken = (await createSession(stranger.id)).sessionToken;
  currentPlan = plan([{ title: "Checkout", lessons: [lesson("Payments", paymentText, [{ id: "incoming-activity", type: "OPEN_QUESTION", config: { prompt: "Explain checkout safety" }, required: true }])] }, { title: "Operations", lessons: [lesson("Deployment", deploymentText)] }]);
  vi.mocked(parseCourseZip).mockImplementation(async () => ({ slug: course.slug, plan: structuredClone(currentPlan) }));
});

afterEach(async () => {
  if (course) await prisma.course.delete({ where: { id: course.id } });
  if (owner) await prisma.user.deleteMany({ where: { id: { in: [owner.id, stranger.id, learner.id] } } });
});

async function preview() {
  const result = await request(app).post(`${endpoint()}/preview`).set(headers()).set("Content-Type", "application/zip").send(Buffer.from("test package"));
  expect(result.status, JSON.stringify(result.body)).toBe(200);
  return result.body.data as CourseUpdatePreview;
}
async function approve(previewId: string) {
  return request(app).post(`${endpoint()}/approve`).set(headers()).send({ previewId, confirm: true });
}

describe("ZIP update preview and approval", () => {
  it("previews a cross-module move without mutation, then retains chapter, block and learner identities", async () => {
    const paymentLesson = currentPlan.modules[0].lessons[0];
    currentPlan.modules[0].lessons = [currentPlan.modules[1].lessons[0]];
    currentPlan.modules[1].lessons = [paymentLesson];
    const diff = await preview();
    expect(diff.modules[1].chapters[0]).toMatchObject({ title: "Payments", action: "moved", previousModule: "Checkout" });
    expect((await prisma.chapter.findUniqueOrThrow({ where: { id: payments.id } })).moduleId).toBe(moduleA.id);
    const before = await prisma.chapterProgress.findMany({ where: { enrollmentId: enrollment.id }, orderBy: { id: "asc" } });
    expect((await approve(diff.previewId)).status).toBe(200);
    expect(await prisma.chapter.findUniqueOrThrow({ where: { id: payments.id } })).toMatchObject({ moduleId: moduleB.id, slug: "payments", archivedAt: null });
    expect(await prisma.chapterProgress.findMany({ where: { enrollmentId: enrollment.id }, orderBy: { id: "asc" } })).toEqual(before);
    expect(await prisma.block.findUniqueOrThrow({ where: { id: blockId } })).toMatchObject({ chapterId: payments.id, archivedAt: null });
    expect(await prisma.response.findUnique({ where: { id: responseId } })).not.toBeNull();
    expect(await prisma.course.findUniqueOrThrow({ where: { id: course.id } })).toMatchObject({ mentorId: owner.id, title: "Original title", status: "PUBLISHED" });
    expect(await prisma.enrollment.findUniqueOrThrow({ where: { id: enrollment.id } })).toMatchObject({ percentComplete: 100, lastActiveAt: enrollment.lastActiveAt });
    expect((await approve(diff.previewId)).status).toBe(409);
  });

  it("archives removed modules and chapters, excludes them from navigation, and restores progress on return", async () => {
    const original = structuredClone(currentPlan);
    currentPlan.modules = [currentPlan.modules[0]];
    const diff = await preview();
    expect(diff.modules.find(m => m.title === "Operations")?.action).toBe("removed");
    expect((await approve(diff.previewId)).status).toBe(200);
    expect((await prisma.chapter.findUniqueOrThrow({ where: { id: deployment.id } })).archivedAt).not.toBeNull();
    const builder = await loadCourseBuilder(owner, course.slug);
    expect(builder.course.modules.map(m => m.id)).toEqual([moduleA.id]);
    expect((await loadCourseGate(course.id, enrollment.id))?.orderedIds).toEqual([payments.id]);
    expect(await prisma.chapterProgress.count({ where: { enrollmentId: enrollment.id } })).toBe(2);
    currentPlan = original;
    const restore = await preview();
    expect(restore.modules.find(m => m.title === "Operations")?.action).toBe("restored");
    expect((await approve(restore.previewId)).status).toBe(200);
    expect((await prisma.chapter.findUniqueOrThrow({ where: { id: deployment.id } })).archivedAt).toBeNull();
    expect(await prisma.chapterProgress.findUniqueOrThrow({ where: { enrollmentId_chapterId: { enrollmentId: enrollment.id, chapterId: deployment.id } } })).toMatchObject({ status: "COMPLETED", timeSpentSeconds: 123 });
  });

  it("rejects stale, expired, unconfirmed and another instructor's approvals", async () => {
    const diff = await preview();
    expect((await request(app).post(`${endpoint()}/approve`).set(headers()).send({ previewId: diff.previewId })).status).toBe(400);
    expect((await request(app).post(`${endpoint()}/approve`).set({ Authorization: `Bearer ${strangerToken}` }).send({ previewId: diff.previewId, confirm: true })).status).toBe(403);
    await prisma.chapter.update({ where: { id: payments.id }, data: { source: "A concurrent edit" } });
    expect((await approve(diff.previewId)).status).toBe(409);
    const latest = await preview();
    await prisma.courseImportPreview.update({ where: { id: latest.previewId }, data: { expiresAt: new Date(0) } });
    expect((await approve(latest.previewId)).status).toBe(409);
  });

  it("creates new chapters and changed activities without overwriting old responses", async () => {
    currentPlan.modules[0].lessons[0].blocks[0].config = { prompt: "Explain checkout safety and validate the receipt" };
    currentPlan.modules[1].lessons.push({ ...lesson("Caching", "Cache product listings with a short expiry and invalidate entries after inventory updates."), lessonNum: 2 });
    const diff = await preview();
    expect((await approve(diff.previewId)).status).toBe(200);
    expect((await prisma.block.findUniqueOrThrow({ where: { id: blockId } })).archivedAt).not.toBeNull();
    expect(await prisma.response.findUnique({ where: { id: responseId } })).not.toBeNull();
    const added = await prisma.chapter.findFirstOrThrow({ where: { courseId: course.id, title: "Caching" } });
    expect(added.publishedAt).not.toBeNull();
    expect(added.compiled).toBe(added.source);
    expect((await prisma.enrollment.findUniqueOrThrow({ where: { id: enrollment.id } })).percentComplete).toBeLessThan(100);
  });

  it("enforces ZIP capability and course scope before parsing; rejects a mismatched slug", async () => {
    vi.mocked(parseCourseZip).mockClear();
    expect((await request(app).post(`${endpoint()}/preview`).set({ Authorization: `Bearer ${strangerToken}` }).set("Content-Type", "application/zip").send(Buffer.from("zip"))).status).toBe(403);
    expect(parseCourseZip).not.toHaveBeenCalled();
    vi.mocked(parseCourseZip).mockResolvedValueOnce({ slug: "another-course", plan: currentPlan });
    expect((await request(app).post(`${endpoint()}/preview`).set(headers()).set("Content-Type", "application/zip").send(Buffer.from("zip"))).status).toBe(400);
    await prisma.user.update({ where: { id: owner.id }, data: { zipImportEnabled: false } });
    expect((await request(app).post(`${endpoint()}/preview`).set(headers()).set("Content-Type", "application/zip").send(Buffer.from("zip"))).status).toBe(403);
  });
});
