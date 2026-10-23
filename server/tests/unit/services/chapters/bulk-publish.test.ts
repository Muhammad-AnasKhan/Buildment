import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ chapters: vi.fn(), transaction: vi.fn(), current: vi.fn(), update: vi.fn(), apply: vi.fn(), compile: vi.fn(), inTransaction: false }));
vi.mock("../../../../src/db/prisma.js", () => ({ prisma: { chapter: { findMany: mocks.chapters }, $transaction: mocks.transaction } }));
vi.mock("../../../../src/services/teach/access.js", () => ({ requireCourseById: vi.fn().mockResolvedValue({ id: "course" }) }));
vi.mock("@mdx-js/mdx", () => ({ compile: mocks.compile }));
vi.mock("../../../../src/services/teach/sync-blocks.js", async original => ({ ...await original<typeof import("../../../../src/services/teach/sync-blocks.js")>(), applyBlockSyncPlans: mocks.apply }));
import { publishChapters } from "../../../../src/services/teach/chapters.js";
import type { SessionUser } from "../../../../src/types/auth.js";

const chapter = { id: "chapter", courseId: "course", moduleId: null, title: "Chapter", summary: null, source: "# Ready", compiled: null, publishedAt: null, archivedAt: null, readerMode: "DEFAULT", order: 1, blocks: [] };
const user = { id: "mentor" } as SessionUser;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.inTransaction = false;
  mocks.chapters.mockResolvedValue([structuredClone(chapter)]);
  mocks.current.mockResolvedValue([structuredClone(chapter)]);
  mocks.update.mockResolvedValue({ count: 1 });
  mocks.compile.mockImplementation(async () => { expect(mocks.inTransaction).toBe(false); });
  mocks.transaction.mockImplementation(async callback => {
    mocks.inTransaction = true;
    try { return await callback({ chapter: { findMany: mocks.current, updateMany: mocks.update } }); }
    finally { mocks.inTransaction = false; }
  });
});

describe("bulk publishing validation boundary", () => {
  it("compiles outside the transaction, then applies all activity plans together", async () => {
    await publishChapters(user, { courseId: "course" });
    expect(mocks.compile).toHaveBeenCalledTimes(1);
    expect(mocks.apply).toHaveBeenCalledTimes(1);
    expect(mocks.update).toHaveBeenCalledTimes(1);
  });
  it.each([
    { ...chapter, source: "# Concurrent edit" },
    { ...chapter, blocks: [{ id: "new-activity", type: "OPEN_QUESTION", config: { prompt: "New" }, sourceHash: null }] },
  ])("rejects concurrent chapter or activity edits before any writes", async current => {
    mocks.current.mockResolvedValue([current]);
    await expect(publishChapters(user, { courseId: "course" })).rejects.toThrow(/changed during validation/);
    expect(mocks.apply).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("does not open a transaction when validation fails", async () => {
    mocks.compile.mockRejectedValueOnce(new Error("Broken MDX"));
    await expect(publishChapters(user, { courseId: "course" })).rejects.toThrow(/Some chapters cannot be published/);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
