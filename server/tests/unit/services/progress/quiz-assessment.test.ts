import { describe, expect, it } from "vitest";
import { calculateQuizAssessment } from "../../../../src/services/progress/quiz-assessment.js";

const deterministic = { id: "quiz", type: "QUIZ", config: {} };
const written = { id: "written", type: "OPEN_QUESTION", config: { autoGrade: "llm" } };
const mentorReviewed = { id: "mentor", type: "OPEN_QUESTION", config: { autoGrade: "mentor" } };

describe("calculateQuizAssessment", () => {
  it("weights automatic and AI-graded answers 80/20 while excluding mentor review", () => {
    const assessment = calculateQuizAssessment({
      blocks: [deterministic, written, mentorReviewed],
      responses: [
        { blockId: "quiz", status: "AUTO_GRADED", score: 1, maxScore: 1 },
        { blockId: "written", status: "AUTO_GRADED", score: 0, maxScore: 1 },
        { blockId: "mentor", status: "PENDING_REVIEW", score: null, maxScore: null },
      ],
    });

    expect(assessment).toMatchObject({
      score: 80,
      passingScore: 70,
      passed: true,
      allAttempted: true,
      deterministic: { score: 100, weight: 80, attempted: 1, total: 1 },
      ai: { score: 0, weight: 20, attempted: 1, total: 1 },
    });
  });

  it("does not pass until every scored question has a submitted response", () => {
    const assessment = calculateQuizAssessment({
      blocks: [deterministic, written],
      responses: [{ blockId: "quiz", status: "AUTO_GRADED", score: 1, maxScore: 1 }],
    });

    expect(assessment).toMatchObject({ score: 80, allAttempted: false, passed: false });
  });

  it("normalizes a chapter with only AI-graded written questions to 100%", () => {
    const assessment = calculateQuizAssessment({
      blocks: [written],
      responses: [{ blockId: "written", status: "AUTO_GRADED", score: 1, maxScore: 1 }],
      passingScore: 90,
    });

    expect(assessment).toMatchObject({ score: 100, passed: true, deterministic: null, ai: { weight: 100 } });
  });
});
