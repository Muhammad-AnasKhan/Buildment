import { describe, expect, it } from "vitest";
import { courseSuggestionMessage, rankCourseSuggestions, type SuggestableCourse } from "./course-suggestions.js";

const course = (id: string, overrides: Partial<SuggestableCourse> = {}): SuggestableCourse => ({
  id,
  title: `Course ${id}`,
  slug: `course-${id}`,
  mentorId: "m1",
  enrollmentCount: 0,
  publishedAt: new Date("2026-01-01T00:00:00Z"),
  ...overrides,
});

describe("rankCourseSuggestions", () => {
  it("leaves out courses the learner already has", () => {
    const ranked = rankCourseSuggestions([course("a"), course("b")], { excludeCourseIds: ["a"] });
    expect(ranked.map((c) => c.id)).toEqual(["b"]);
  });

  it("prefers the finished course's instructor, then popularity, then the newest", () => {
    const courses = [
      course("popular", { mentorId: "other", enrollmentCount: 50 }),
      course("same-mentor", { mentorId: "m1", enrollmentCount: 1 }),
      course("newer", { mentorId: "other", enrollmentCount: 5, publishedAt: new Date("2026-06-01T00:00:00Z") }),
      course("older", { mentorId: "other", enrollmentCount: 5 }),
    ];
    expect(rankCourseSuggestions(courses, { excludeCourseIds: [], preferMentorId: "m1" }).map((c) => c.id)).toEqual([
      "same-mentor",
      "popular",
      "newer",
    ]);
    expect(rankCourseSuggestions(courses, { excludeCourseIds: [] })[0]!.id).toBe("popular");
  });
});

describe("courseSuggestionMessage", () => {
  it("invites someone who never enrolled to pick a first course", () => {
    expect(courseSuggestionMessage("first", [course("a"), course("b")])).toEqual({
      title: "Find your first course",
      body: "Start learning with Course a. It only takes a few minutes to begin. You might also like Course b.",
      url: "/catalog/course-a",
    });
  });

  it("points someone who finished everything at the next course", () => {
    expect(courseSuggestionMessage("next", [course("a")], "Intro to SQL")).toEqual({
      title: "Ready for your next course?",
      body: "You finished Intro to SQL. Keep going with Course a.",
      url: "/catalog/course-a",
    });
  });
});
