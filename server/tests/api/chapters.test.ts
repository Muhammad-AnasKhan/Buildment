import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { completeChapter, createCourseFixture } from "../helpers/fixtures.js";

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;

beforeAll(async () => {
  fx = await createCourseFixture();
});
afterAll(() => fx.cleanup());

const submit = (answers: unknown) =>
  request(app)
    .post(`/api/v1/chapters/${fx.chapterB.id}/quiz/submit`)
    .set("Authorization", `Bearer ${fx.learnerToken}`)
    .send({ answers });

describe("POST /api/v1/chapters/:chapterId/quiz/submit", () => {
  it("404s for chapters that are not quiz chapters", async () => {
    const res = await request(app)
      .post(`/api/v1/chapters/${fx.chapterA.id}/quiz/submit`)
      .set("Authorization", `Bearer ${fx.learnerToken}`)
      .send({ answers: [{ blockId: fx.quizBlock.id, selected: ["a"] }] });
    expect(res.status).toBe(404);
  });

  it("refuses a locked chapter in a sequential course", async () => {
    const res = await submit(fx.quizChapterBlocks.map((b) => ({ blockId: b.id, selected: ["a"] })));
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("CHAPTER_LOCKED");
  });

  it("requires every question exactly once", async () => {
    await completeChapter(fx.enrollment.id, fx.chapterA.id);
    const res = await submit([{ blockId: fx.quizChapterBlocks[0]!.id, selected: ["a"] }]);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/exactly once/);
  });

  it("grades every question and keeps correct answers on resubmission", async () => {
    const [q1, q2] = fx.quizChapterBlocks;
    const first = await submit([
      { blockId: q1!.id, selected: ["a"] },
      { blockId: q2!.id, selected: ["b"] },
    ]);
    expect(first.status).toBe(200);
    expect(first.body.data).toMatchObject({ score: 1, maxScore: 2, questions: 2 });

    const second = await submit([
      { blockId: q1!.id, selected: ["b"] },
      { blockId: q2!.id, selected: ["a"] },
    ]);
    expect(second.body.data.score).toBe(2);
    const byBlock = Object.fromEntries(second.body.data.grades.map((g: { blockId: string; isCorrect: boolean }) => [g.blockId, g.isCorrect]));
    expect(byBlock[q1!.id]).toBe(true);
    expect(byBlock[q2!.id]).toBe(true);
  });
});
