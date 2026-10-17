import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ blocks: vi.fn(), responses: vi.fn() }));
vi.mock("../../db/prisma.js", () => ({ prisma: { block: { findMany: mocks.blocks }, response: { findMany: mocks.responses } } }));
import { loadQuizChapterState } from "./quiz-state.js";

describe("quiz flow question types", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.responses.mockResolvedValue([]); });
  it("keeps mixed questions in order while only grading multiple choice", async () => {
    mocks.blocks.mockResolvedValue([{ id: "open", type: "OPEN_QUESTION", config: {} }, { id: "quiz", type: "QUIZ", config: {} }]);
    const state = await loadQuizChapterState("chapter", "learner");
    expect(state.steps).toEqual([{ id: "open", type: "OPEN_QUESTION" }, { id: "quiz", type: "QUIZ" }]);
    expect(state.blockIds).toEqual(["quiz"]);
    expect(state.initialAnswers).toEqual({ quiz: [] });
    expect(mocks.blocks.mock.calls[0][0].where.type).toEqual({ in: ["QUIZ", "OPEN_QUESTION", "PREDICT", "CODE"] });
  });
  it("renders open-question-only chapters without a multiple-choice submission", async () => {
    mocks.blocks.mockResolvedValue([{ id: "open", type: "OPEN_QUESTION", config: {} }]);
    const state = await loadQuizChapterState("chapter", "learner");
    expect(state.steps).toEqual([{ id: "open", type: "OPEN_QUESTION" }]);
    expect(state.blockIds).toEqual([]);
    expect(state.initialScoreSummary).toBeNull();
    expect(mocks.responses).not.toHaveBeenCalled();
  });
});
