import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/db/prisma.js";
import { createCourseFixture } from "../helpers/fixtures.js";
import { publishChapters } from "../../src/services/teach/chapters.js";
import { BLOCK_SYNC_BATCH_SIZE, applyBlockSyncPlans, planChapterBlockSync, prepareChapterBlockSync } from "../../src/services/teach/sync-blocks.js";

let fx: Awaited<ReturnType<typeof createCourseFixture>>;
beforeAll(async () => { fx = await createCourseFixture(); });
afterAll(async () => { await fx.cleanup(); });

describe("batched activity publishing", () => {
  it("creates, changes and archives more than one batch while retaining learner responses", async () => {
    // This exercises the draft block-sync path; published courses use immutable release copies.
    await prisma.course.update({ where: { id: fx.course.id }, data: { status: "DRAFT" } });
    const module = await prisma.module.create({ data: { courseId: fx.course.id, title: "Batch publishing", order: 2 } });
    const size = BLOCK_SYNC_BATCH_SIZE + 5;
    const ids = Array.from({ length: size }, (_, i) => `batch-${fx.tag}-${i}`);
    const source = (prefix: string, active = ids) => active.map(id => `<OpenQuestion id="${id}" prompt="${prefix} ${id}" minWords={0} />`).join("\n\n");
    const chapter = await prisma.chapter.create({ data: { courseId: fx.course.id, moduleId: module.id, title: "Batch", slug: "batch-publish", order: 1, source: source("Original") } });
    try {
      await publishChapters(fx.mentor, { moduleId: module.id });
      expect(await prisma.block.count({ where: { chapterId: chapter.id, archivedAt: null } })).toBe(size);
      const response = await prisma.response.create({ data: { blockId: ids[0], userId: fx.learner.id, enrollmentId: fx.enrollment.id, payload: { text: "Keep this response" } } });
      await prisma.chapter.update({ where: { id: chapter.id }, data: { source: source("Edited") } });
      await publishChapters(fx.mentor, { moduleId: module.id });
      const updated = await prisma.block.findMany({ where: { chapterId: chapter.id } });
      expect(updated).toHaveLength(size);
      expect(updated.every(block => block.version === 2 && (block.config as { prompt: string }).prompt.startsWith("Edited "))).toBe(true);
      expect(await prisma.response.findUnique({ where: { id: response.id } })).not.toBeNull();
      // No-op publishing must not increment activity versions.
      await publishChapters(fx.mentor, { moduleId: module.id });
      expect((await prisma.block.findUniqueOrThrow({ where: { id: ids[0] } })).version).toBe(2);
      await prisma.chapter.update({ where: { id: chapter.id }, data: { source: "# Activities retired" } });
      await publishChapters(fx.mentor, { moduleId: module.id });
      expect(await prisma.block.count({ where: { chapterId: chapter.id, archivedAt: null } })).toBe(0);
      expect(await prisma.block.count({ where: { chapterId: chapter.id, archivedAt: { not: null } } })).toBe(size);
      expect(await prisma.response.findUnique({ where: { id: response.id } })).not.toBeNull();
    } finally {
      await prisma.chapter.delete({ where: { id: chapter.id } });
      await prisma.module.delete({ where: { id: module.id } });
      await prisma.course.update({ where: { id: fx.course.id }, data: { status: "PUBLISHED" } });
    }
  }, 60000);

  it("rolls back earlier batches when a later activity disappears", async () => {
    const ids = Array.from({ length: BLOCK_SYNC_BATCH_SIZE + 1 }, (_, i) => `rollback-${fx.tag}-${i}`);
    await prisma.block.createMany({ data: ids.map(id => ({ id, chapterId: fx.chapterA.id, type: "OPEN_QUESTION" as const, order: 1, sourceHash: "previous", config: { prompt: "Before" } })) });
    try {
      const existing = await prisma.block.findMany({ where: { id: { in: ids } } });
      const source = ids.map(id => `<OpenQuestion id="${id}" prompt="After" />`).join("\n\n");
      const plan = planChapterBlockSync(fx.chapterA.id, prepareChapterBlockSync(source), existing);
      await prisma.block.delete({ where: { id: ids[ids.length - 1] } });
      await expect(prisma.$transaction(tx => applyBlockSyncPlans(tx, [plan]))).rejects.toThrow(/activities changed/);
      const saved = await prisma.block.findMany({ where: { id: { in: ids } } });
      expect(saved.every(block => block.version === 1 && block.sourceHash === "previous" && (block.config as { prompt: string }).prompt === "Before")).toBe(true);
    } finally { await prisma.block.deleteMany({ where: { id: { in: ids } } }); }
  }, 20000);
});
