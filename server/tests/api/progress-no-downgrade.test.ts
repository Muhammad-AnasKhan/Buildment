import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { recomputeChapterProgress, repairEnrollmentProgress } from "../../src/services/progress/compute.js";
import { createCourseFixture } from "../helpers/fixtures.js";

// A finished chapter must not reopen because content was added later (the 1.2
// lockout: a restored required read put every later chapter behind it). Blocks
// that were there when the learner finished keep the normal rules.

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;

beforeEach(async () => {
  fx = await createCourseFixture();
});
afterEach(() => fx.cleanup());

const respond = (blockId: string, body: object) =>
  request(app).post(`/api/v1/blocks/${blockId}/respond`).set({ Authorization: `Bearer ${fx.learnerToken}` }).send(body);

const progressFor = () =>
  prisma.chapterProgress.findUniqueOrThrow({
    where: { enrollmentId_chapterId: { enrollmentId: fx.enrollment.id, chapterId: fx.chapterA.id } },
  });

const recompute = () =>
  prisma.$transaction((tx) => recomputeChapterProgress(tx, fx.enrollment.id, fx.chapterA.id));

/** Finish chapter A through the API, the way a learner does. */
async function finishChapterA() {
  expect((await respond(fx.quizBlock.id, { selected: ["a"] })).status).toBe(200);
  expect((await respond(fx.mustReadBlock.id, { complete: true })).status).toBe(200);
  const done = await progressFor();
  expect(done.status).toBe("COMPLETED");
  expect(done.completedAt).not.toBeNull();
  return done.completedAt!;
}

const READ_CONFIG = {
  title: "New read",
  description: "Added after the learner finished.",
  url: "https://example.com/new-read",
  completionRule: "confirm_read",
};

async function addRequiredRead(createdAt: Date | null) {
  const block = await prisma.block.create({
    data: { id: `blk-new-${fx.tag}-${Date.now()}`, chapterId: fx.chapterA.id, type: "MUST_READ", order: 3, config: READ_CONFIG },
  });
  // The column default stamps "now"; tests pin it so DB and host clocks cannot disagree.
  return prisma.block.update({ where: { id: block.id }, data: { createdAt } });
}

describe("recomputeChapterProgress never downgrades for blocks added after completion", () => {
  it("keeps a completed chapter COMPLETED when a required block is added later", async () => {
    const completedAt = await finishChapterA();
    await addRequiredRead(new Date(completedAt.getTime() + 60_000));

    await recompute();

    const after = await progressFor();
    expect(after.status).toBe("COMPLETED");
    expect(after.completedAt).toEqual(completedAt);
    expect(after).toMatchObject({ blocksTotal: 2, blocksCompleted: 2 });
  });

  it("keeps it COMPLETED through the mentor repair path too", async () => {
    const completedAt = await finishChapterA();
    await addRequiredRead(new Date(completedAt.getTime() + 60_000));

    await prisma.$transaction((tx) => repairEnrollmentProgress(tx, fx.enrollment.id, fx.course.id));

    expect((await progressFor()).status).toBe("COMPLETED");
  });

  it("counts the new block once the learner does it", async () => {
    const completedAt = await finishChapterA();
    const added = await addRequiredRead(new Date(completedAt.getTime() + 60_000));

    expect((await respond(added.id, { complete: true })).status).toBe(200);

    const after = await progressFor();
    expect(after).toMatchObject({ status: "COMPLETED", blocksTotal: 3, blocksCompleted: 3 });
    expect(after.completedAt).toEqual(completedAt);
  });
});

describe("blocks that existed before completion keep the normal rules", () => {
  it("reopens the chapter for an unanswered required block created before completion", async () => {
    const completedAt = await finishChapterA();
    await addRequiredRead(new Date(completedAt.getTime() - 60_000));

    await recompute();

    const after = await progressFor();
    expect(after).toMatchObject({ status: "IN_PROGRESS", blocksTotal: 3, blocksCompleted: 2, completedAt: null });
  });

  it("reopens the chapter for a legacy block with no createdAt", async () => {
    await finishChapterA();
    await addRequiredRead(null);

    await recompute();

    expect((await progressFor()).status).toBe("IN_PROGRESS");
  });

  it("still reopens the chapter when an existing checkpoint regresses", async () => {
    await finishChapterA();
    const latest = await prisma.response.findFirstOrThrow({
      where: { blockId: fx.quizBlock.id, userId: fx.learner.id },
      orderBy: { attempt: "desc" },
    });
    // A newer wrong attempt on a retryable quiz means the checkpoint is no longer met.
    await prisma.response.create({
      data: {
        blockId: fx.quizBlock.id,
        userId: fx.learner.id,
        enrollmentId: fx.enrollment.id,
        attempt: latest.attempt + 1,
        status: "AUTO_GRADED",
        payload: { selected: ["b"] },
        isCorrect: false,
      },
    });

    await recompute();

    expect((await progressFor()).status).toBe("IN_PROGRESS");
  });
});
