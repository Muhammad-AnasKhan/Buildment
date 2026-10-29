import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ blocks: vi.fn(), responses: vi.fn(), chapter: vi.fn(), enrollment: vi.fn() }));
vi.mock("../../../../src/db/prisma.js", () => ({ prisma: { block: { findMany: mocks.blocks }, response: { findMany: mocks.responses },
  chapter: { findUnique: mocks.chapter }, enrollment: { findUnique: mocks.enrollment } } }));
import { loadQuizChapterState } from "../../../../src/services/chapters/quiz-state.js";

describe("quiz flow question types", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.responses.mockResolvedValue([]);
    mocks.chapter.mockResolvedValue({ courseId: "course", course: { familySlug: null } }); mocks.enrollment.mockResolvedValue(null); });
  it("keeps mixed questions in order while only grading multiple choice", async () => {
    mocks.blocks.mockResolvedValue([{ id: "open", type: "OPEN_QUESTION", config: {} }, { id: "quiz", type: "QUIZ", config: {} }]);
    const state = await loadQuizChapterState("chapter", "learner");
    expect(state.steps).toEqual([{ id: "open", type: "OPEN_QUESTION" }, { id: "quiz", type: "QUIZ" }]);
    expect(state.blockIds).toEqual(["quiz"]);
    expect(state.initialAnswers).toEqual({ quiz: [] });
    expect(mocks.blocks.mock.calls[0][0].where.type).toEqual({ in: ["QUIZ", "OPEN_QUESTION", "PREDICT", "CODE"] });
  });
  it("loads open-question-only chapters so an AI-written assessment can be calculated", async () => {
    mocks.blocks.mockResolvedValue([{ id: "open", type: "OPEN_QUESTION", config: {} }]);
    const state = await loadQuizChapterState("chapter", "learner");
    expect(state.steps).toEqual([{ id: "open", type: "OPEN_QUESTION" }]);
    expect(state.blockIds).toEqual([]);
    expect(state.initialScoreSummary).toBeNull();
    expect(mocks.responses).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ blockId: { in: ["open"] }, status: { not: "DRAFT" } }),
    }));
  });
});
