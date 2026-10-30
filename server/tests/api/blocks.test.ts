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
afterAll(() => fx.cleanup());

const respond = (blockId: string, token: string | null, body: unknown) => {
  const req = request(app).post(`/api/v1/blocks/${blockId}/respond`).send(body as object);
  return token ? req.set("Authorization", `Bearer ${token}`) : req;
};

describe("POST /api/v1/blocks/:blockId/respond", () => {
  it("404s for unknown blocks before checking auth (quiz client relies on this)", async () => {
    const res = await respond("missing-block", null, { selected: ["a"] });
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });

  it("401s anonymous submissions to a real block", async () => {
    const res = await respond(fx.quizBlock.id, null, { selected: ["a"] });
    expect(res.status).toBe(401);
  });

  it("403s learners who have not verified their email", async () => {
    const res = await respond(fx.quizBlock.id, fx.unverifiedToken, { selected: ["a"] });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("EMAIL_UNVERIFIED");
  });

  it("rejects quiz blocks inside quiz-mode chapters", async () => {
    const res = await respond(fx.quizChapterBlocks[0]!.id, fx.learnerToken, { selected: ["a"] });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("QUIZ_CHAPTER");
  });

  it("grades a quiz answer, stores the attempt and updates chapter progress", async () => {
    const wrong = await respond(fx.quizBlock.id, fx.learnerToken, { selected: ["b"] });
    expect(wrong.status).toBe(200);
    expect(wrong.body.data).toMatchObject({ isCorrect: false, score: 0, maxScore: 1 });
    // A wrong answer must not reveal the explanation of the right one.
    expect(wrong.body.data.explanation).toBeUndefined();

    const right = await respond(fx.quizBlock.id, fx.learnerToken, { selected: ["a"] });
    expect(right.body.data).toMatchObject({ isCorrect: true, score: 1, status: "AUTO_GRADED", explanation: "Basic arithmetic." });

    const attempts = await prisma.response.findMany({ where: { blockId: fx.quizBlock.id, userId: fx.learner.id }, orderBy: { attempt: "asc" } });
    expect(attempts.map((a) => a.attempt)).toEqual([1, 2]);

    const progress = await prisma.chapterProgress.findUnique({
      where: { enrollmentId_chapterId: { enrollmentId: fx.enrollment.id, chapterId: fx.chapterA.id } },
    });
    expect(progress?.status).toBe("IN_PROGRESS");
    expect(progress?.blocksCompleted).toBe(1);
  });

  it("makes the chapter eligible without completing it when every required block is satisfied", async () => {
    const res = await respond(fx.mustReadBlock.id, fx.learnerToken, { complete: true });
    expect(res.status).toBe(200);
    const progress = await prisma.chapterProgress.findUnique({
      where: { enrollmentId_chapterId: { enrollmentId: fx.enrollment.id, chapterId: fx.chapterA.id } },
    });
    expect(progress).toMatchObject({ status: "IN_PROGRESS", blocksCompleted: 2, blocksTotal: 2 });
  });

  it("returns field errors when the payload does not match the block schema", async () => {
    const res = await respond(fx.quizBlock.id, fx.learnerToken, { selected: "a" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
    expect(res.body.errors[0].field).toBe("selected");
  });
});
