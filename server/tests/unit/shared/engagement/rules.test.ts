import { describe, expect, it } from "vitest";
import type { RecordedEngagementEvent } from "../../../../src/shared/api/engagement.js";
import { DOT_CLIPS } from "../../../../src/shared/engagement/dot-voice.js";
import { ENGAGEMENT_RULES, matchingRules } from "../../../../src/shared/engagement/rules.js";

let n = 0;
function event(partial: Partial<RecordedEngagementEvent> & Pick<RecordedEngagementEvent, "type">): RecordedEngagementEvent {
  return {
    id: `evt-${++n}`,
    courseId: "course",
    chapterId: "chapter",
    isNew: true,
    createdAt: new Date(0).toISOString(),
    payload: {},
    ...partial,
  } as RecordedEngagementEvent;
}

const quiz = (passed: boolean, attempt: number, score: number) =>
  event({ type: "quiz_submitted", payload: { passed, attempt, score } });

const top = (...events: RecordedEngagementEvent[]) => matchingRules(events)[0] ?? null;

describe("engagement rules", () => {
  it("welcomes a new enrollment and celebrates finishing a chapter", () => {
    expect(top(event({ type: "enrolled" }))).toMatchObject({ state: "begin", role: "guide" });
    expect(top(event({ type: "chapter_completed" }))).toMatchObject({ state: "celebrate", role: "celebrator" });
  });

  it("marks course milestones above the chapter they came with", () => {
    const milestone = (type: "course_first_chapter" | "course_halfway" | "course_one_left") =>
      top(event({ type: "chapter_completed" }), event({ type, payload: { chaptersCompleted: 1, totalChapters: 4 } }));
    expect(milestone("course_first_chapter")).toMatchObject({ id: "course-first-chapter", role: "guide", state: "first_step" });
    expect(milestone("course_halfway")).toMatchObject({ id: "course-halfway", role: "celebrator", state: "halfway" });
    expect(milestone("course_one_left")).toMatchObject({ id: "course-one-left", role: "celebrator", state: "almost" });
  });

  it("offers a mentor when a chapter takes a while, and a break after a long session", () => {
    const lingering = top(event({ type: "chapter_lingering" }));
    expect(lingering).toMatchObject({ role: "helper", state: "stuck" });
    expect(lingering?.action?.(event({ type: "chapter_lingering" }))).toEqual({ label: "Ask a mentor", intent: "ask-help" });
    expect(top(event({ type: "long_session" }))).toMatchObject({ role: "supporter", state: "rest" });
  });

  it("has the messenger announce each kind of message with a link to it", () => {
    const message = (kind: "reply" | "approved" | "feedback" | "resolved", url: string | null = "/my-questions/t1") =>
      event({ type: "message_received", payload: { kind, url } });
    expect(top(message("reply"))).toMatchObject({ id: "message-reply", role: "messenger", state: "message" });
    expect(top(message("approved"))).toMatchObject({ id: "message-approved", state: "message_good" });
    expect(top(message("feedback"))).toMatchObject({ id: "message-feedback", state: "message_feedback" });
    expect(top(message("resolved"))).toMatchObject({ id: "message-resolved", state: "message_done" });
    expect(top(message("reply"))?.action?.(message("reply"))).toEqual({ label: "Open", href: "/my-questions/t1" });
    expect(top(message("reply", null))?.action?.(message("reply", null))).toBeNull();
  });

  it("encourages note taking with a ten minute cooldown", () => {
    expect(top(event({ type: "notes_saved" }))).toMatchObject({ state: "encourage", role: "supporter", cooldownMs: 600_000 });
  });

  it("says \"not quite\" after a first miss and offers to look again after repeated misses", () => {
    expect(top(quiz(false, 1, 50))).toMatchObject({ state: "retry", messages: ["Hmm, not quite!"], clip: "not-quite" });
    expect(top(quiz(false, 2, 50))).toMatchObject({ state: "help", messages: ["Let's look again!"], clip: "look-again" });
    expect(top(quiz(false, 5, 0))).toMatchObject({ state: "help" });
  });

  it("praises a pass after misses above a perfect score", () => {
    expect(top(quiz(true, 3, 100))).toMatchObject({ messages: ["You got it!"], clip: "got-it" });
    expect(top(quiz(true, 1, 100))).toMatchObject({ messages: ["You passed!"], clip: "you-passed" });
  });

  it("says nothing extra for a first-try pass below 100 (the chapter celebration covers it)", () => {
    expect(top(quiz(true, 1, 80))).toBeNull();
  });

  it("puts graduation above everything else in the same batch", () => {
    const rule = top(quiz(true, 2, 100), event({ type: "chapter_completed" }), event({ type: "course_completed" }));
    expect(rule).toMatchObject({ id: "course-graduation", state: "graduation" });
  });

  it("welcomes back only after three or more days away, as an ambient reaction", () => {
    const back = (daysAway: number | null) => top(event({ type: "session_start", payload: { daysAway } }));
    expect(back(3)).toMatchObject({ state: "welcome_back", messages: ["You're back! I missed you!"], clip: "missed-you", ambient: true });
    expect(back(13)).toMatchObject({ state: "welcome_back" });
    expect(back(2)).toBeNull();
  });

  it("welcomes a learner's very first session with Dot's introduction", () => {
    const first = top(event({ type: "session_start", payload: { daysAway: null } }));
    expect(first).toMatchObject({ id: "first-visit", clip: "welcome", ambient: true });
    expect(top(event({ type: "enrolled" }))).not.toHaveProperty("clip");
  });

  it("offers the chapter to pick up again after a long time away", () => {
    const resume = { href: "/courses/c/ch-3", chapterTitle: "Chapter 3" };
    const back = event({ type: "session_start", payload: { daysAway: 20, resume } });
    const rule = top(back);
    expect(rule).toMatchObject({ id: "welcome-back-long", state: "reunion", ambient: true });
    expect(rule?.action?.(back)).toEqual({ label: "Continue", href: "/courses/c/ch-3" });
    expect(rule?.action?.(event({ type: "session_start", payload: { daysAway: 20 } }))).toBeNull();
  });

  it("ignores moments that were already recorded", () => {
    expect(top(event({ type: "enrolled", isNew: false }))).toBeNull();
    expect(top(event({ type: "course_completed", isNew: false }), event({ type: "chapter_completed" }))).toMatchObject({
      id: "chapter-completed",
    });
  });

  it("never guilts the learner, in any of its lines", () => {
    for (const rule of ENGAGEMENT_RULES) {
      for (const line of rule.messages) {
        // "I missed you" is Dot being glad; "you missed …" would count what the learner did not do.
        expect(line).not.toMatch(/\b(fail|failed|wrong|missed(?! you)|days?|lazy|again\?)\b/i);
      }
    }
  });

  it("gives every rule one short line in Dot's voice", () => {
    for (const rule of ENGAGEMENT_RULES) {
      expect(rule.messages, rule.id).toHaveLength(1);
      if (!rule.clip) expect(rule.messages[0].split(/\s+/).length, rule.id).toBeLessThanOrEqual(6);
    }
  });

  it("says exactly the words of the clip a rule plays", () => {
    for (const rule of ENGAGEMENT_RULES) {
      if (rule.clip) expect(rule.messages[0], rule.id).toBe(DOT_CLIPS[rule.clip]);
    }
  });
});
