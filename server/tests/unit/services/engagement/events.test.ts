import { describe, expect, it } from "vitest";
import { courseMilestonesFor, summarizeQuizAttempt, wholeDaysAway } from "../../../../src/services/engagement/events.js";
import { trackEventBody } from "../../../../src/validations/engagement.js";

const quizBlock = (latest: { attempt: number; isCorrect: boolean; score?: number } | null, allowRetry = true) => ({
  type: "QUIZ" as const,
  config: { allowRetry },
  latest: latest && {
    attempt: latest.attempt,
    status: "AUTO_GRADED",
    isCorrect: latest.isCorrect,
    score: latest.score ?? (latest.isCorrect ? 1 : 0),
    maxScore: 1,
  },
});

describe("summarizeQuizAttempt", () => {
  it("reports the latest attempt, the pass rule and a percentage", () => {
    expect(summarizeQuizAttempt([quizBlock({ attempt: 1, isCorrect: true }), quizBlock({ attempt: 1, isCorrect: false })])).toEqual({
      passed: false,
      attempt: 1,
      score: 50,
    });
    // Correct answers are kept between attempts, so only the question that was wrong has attempt 2.
    expect(summarizeQuizAttempt([quizBlock({ attempt: 1, isCorrect: true }), quizBlock({ attempt: 2, isCorrect: true })])).toEqual({
      passed: true,
      attempt: 2,
      score: 100,
    });
  });

  it("counts a wrong answer as passed when the question allows no retry, like chapter completion does", () => {
    expect(summarizeQuizAttempt([quizBlock({ attempt: 1, isCorrect: false }, false)])).toMatchObject({ passed: true, score: 0 });
  });

  it("is not passed while a question has no answer", () => {
    expect(summarizeQuizAttempt([quizBlock({ attempt: 1, isCorrect: true }), quizBlock(null)])).toMatchObject({ passed: false });
  });
});

describe("courseMilestonesFor", () => {
  it("marks the first chapter, the halfway point and the last chapter left", () => {
    expect(courseMilestonesFor(1, 10)).toEqual(["course_first_chapter"]);
    expect(courseMilestonesFor(4, 10)).toEqual([]);
    expect(courseMilestonesFor(5, 10)).toEqual(["course_halfway"]);
    expect(courseMilestonesFor(6, 10)).toEqual(["course_halfway"]);
    expect(courseMilestonesFor(9, 10)).toEqual(["course_one_left"]);
    expect(courseMilestonesFor(10, 10)).toEqual([]);
  });

  it("rounds the halfway point up for an odd number of chapters", () => {
    expect(courseMilestonesFor(2, 5)).toEqual([]);
    expect(courseMilestonesFor(3, 5)).toEqual(["course_halfway"]);
  });

  it("keeps small courses to the moments that mean something", () => {
    expect(courseMilestonesFor(1, 2)).toEqual([]);
    expect(courseMilestonesFor(1, 3)).toEqual(["course_first_chapter"]);
    expect(courseMilestonesFor(2, 3)).toEqual(["course_one_left"]);
    expect(courseMilestonesFor(2, 4)).toEqual(["course_halfway"]);
  });
});

describe("wholeDaysAway", () => {
  const now = new Date("2026-10-22T12:00:00Z");

  it("is null for someone never seen", () => {
    expect(wholeDaysAway([], now)).toBeNull();
  });

  it("counts whole days from the most recent sighting", () => {
    expect(wholeDaysAway([new Date("2026-10-10T12:00:00Z"), new Date("2026-10-19T11:00:00Z")], now)).toBe(3);
    expect(wholeDaysAway([new Date("2026-10-19T13:00:00Z")], now)).toBe(2);
  });
});

describe("trackEventBody", () => {
  it("rejects unknown event types", () => {
    expect(trackEventBody.safeParse({ type: "level_up" }).success).toBe(false);
  });

  it("requires the id each type is about and defaults the platform to web", () => {
    expect(trackEventBody.safeParse({ type: "quiz_submitted" }).success).toBe(false);
    expect(trackEventBody.safeParse({ type: "enrolled", chapterId: "c1" }).success).toBe(false);
    expect(trackEventBody.parse({ type: "session_start" })).toEqual({ type: "session_start", platform: "web" });
    expect(trackEventBody.parse({ type: "notes_saved", chapterId: "c1", platform: "ios" })).toMatchObject({ platform: "ios" });
  });

  it("does not let the client send facts the server derives", () => {
    const parsed = trackEventBody.parse({ type: "quiz_submitted", chapterId: "c1", payload: { score: 100 }, userId: "someone" });
    expect(parsed).toEqual({ type: "quiz_submitted", chapterId: "c1", platform: "web" });
  });
});
