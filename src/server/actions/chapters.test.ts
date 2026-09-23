import { beforeEach, describe, expect, it, vi } from "vitest";

const { chapterFindUnique, chapterUpdate, requireMentor } = vi.hoisted(() => ({
  chapterFindUnique: vi.fn(),
  chapterUpdate: vi.fn(),
  requireMentor: vi.fn(),
}));

vi.mock("@/server/db", () => ({
  prisma: {
    chapter: {
      findUnique: chapterFindUnique,
      update: chapterUpdate,
    },
  },
}));

vi.mock("@/server/auth/guards", () => ({
  requireMentorOfCourse: requireMentor,
}));

import { updateChapterSettings } from "./chapters";

describe("updateChapterSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chapterFindUnique.mockResolvedValue({ id: "chapter-1", courseId: "course-1" });
    chapterUpdate.mockResolvedValue({ id: "chapter-1" });
  });

  it("authorizes against the chapter course and persists validated settings", async () => {
    const result = await updateChapterSettings({
      chapterId: "chapter-1",
      title: "  Ship the game  ",
      summary: "  Prepare a production release.  ",
      estimatedMinutes: 25,
      readerMode: "DEFAULT",
      isMilestone: true,
    });

    expect(result.ok).toBe(true);
    expect(requireMentor).toHaveBeenCalledWith("course-1");
    expect(chapterUpdate).toHaveBeenCalledWith({
      where: { id: "chapter-1" },
      data: {
        title: "Ship the game",
        summary: "Prepare a production release.",
        estimatedMinutes: 25,
        readerMode: "DEFAULT",
        isMilestone: true,
      },
    });
  });

  it("rejects invalid settings before reading or writing the database", async () => {
    const result = await updateChapterSettings({
      chapterId: "chapter-1",
      title: "",
      summary: null,
      estimatedMinutes: 0,
      readerMode: "QUIZ",
      isMilestone: false,
    });

    expect(result.ok).toBe(false);
    expect(chapterFindUnique).not.toHaveBeenCalled();
    expect(chapterUpdate).not.toHaveBeenCalled();
  });
});
