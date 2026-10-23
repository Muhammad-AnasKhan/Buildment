import { describe, expect, it } from "vitest";
import { chapterSimilarity, matchCourseUpdate, textSimilarity, type ExistingChapter, type ExistingModule, type IncomingLesson } from "../../src/services/teach/course-update-matching.js";
import type { ImportPlan } from "../../src/services/teach/course-import.js";

const payment = "Validate checkout inputs before charging the customer. Check the order total against the saved basket. Reject expired payment tokens and record the final transaction safely.";
const deployment = "Deploy the server to production using environment variables. Configure the database connection and run migrations. Check application health before accepting incoming traffic.";
function lesson(title: string, source: string): IncomingLesson {
  return { title, source, summary: null, estimatedMinutes: 10, lessonNum: 1, slugPart: title.toLowerCase(), readerMode: "DEFAULT", isMilestone: false, blocks: [] };
}
function chapter(id: string, moduleId: string, input: IncomingLesson, extra: Partial<ExistingChapter> = {}): ExistingChapter {
  return { ...input, blocks: input.blocks.map(block => ({ ...block, archivedAt: null })), id, moduleId, slug: id, order: 1, archivedAt: null, ...extra };
}
const modules: ExistingModule[] = [
  { id: "a", title: "Checkout", order: 1, archivedAt: null },
  { id: "b", title: "Operations", order: 2, archivedAt: null },
];
const plan = (entries: ImportPlan["modules"]): ImportPlan => ({ manifest: { title: "Test", description: "Test", projectGoal: "Test", difficulty: "beginner", estimatedHours: 1 }, modules: entries });

describe("ID-free course update matching", () => {
  it("matches moved chapters across modules while retaining their database identities", () => {
    const payments = lesson("Payments", payment), deploy = lesson("Deployment", deployment);
    const result = matchCourseUpdate(plan([{ title: "Checkout", lessons: [deploy] }, { title: "Operations", lessons: [payments] }]), modules,
      [chapter("payment", "a", payments), chapter("deploy", "b", deploy)]);
    expect(result.mapping[0].chapters[0].chapterId).toBe("deploy");
    expect(result.mapping.map(module => module.moduleId)).toEqual(["a", "b"]);
    expect(result.mapping[1].chapters[0].chapterId).toBe("payment");
    expect(result.modules[1].chapters[0]).toMatchObject({ action: "moved", previousModule: "Checkout", similarity: 1 });
  });
  it("matches a moved, renamed, lightly edited chapter using content similarity", () => {
    const old = lesson("Payments", payment);
    const incoming = lesson("Safe checkout", `${payment} Log errors for investigation.`);
    const result = matchCourseUpdate(plan([{ title: "Operations", lessons: [incoming] }]), modules, [chapter("payment", "a", old)]);
    expect(result.mapping[0].chapters[0].chapterId).toBe("payment");
    expect(result.mapping[0].chapters[0].similarity).toBeGreaterThanOrEqual(0.8);
    expect(result.modules[0].chapters[0].changes).toContain("Content or activities");
  });
  it("restores archived chapters and recognizes renamed modules through their contents", () => {
    const old = lesson("Payments", payment);
    const result = matchCourseUpdate(plan([{ title: "Taking payments", lessons: [old] }]), [{ ...modules[0], archivedAt: new Date(), order: -1 }],
      [chapter("payment", "a", old, { archivedAt: new Date() })]);
    expect(result.mapping[0].moduleId).toBe("a");
    expect(result.modules[0].action).toBe("restored");
    expect(result.modules[0].chapters[0].action).toBe("restored");
  });
  it("does not transfer progress to ambiguous copies or duplicate existing content", () => {
    const old = lesson("Payments", payment);
    const copied = matchCourseUpdate(plan([{ title: "Checkout", lessons: [old, { ...old, lessonNum: 2 }] }]), modules, [chapter("payment", "a", old)]);
    expect(copied.mapping[0].chapters.map(c => c.chapterId)).toEqual([null, null]);
    const ambiguous = matchCourseUpdate(plan([{ title: "Checkout", lessons: [old] }]), modules, [chapter("one", "a", old), chapter("two", "b", old)]);
    expect(ambiguous.mapping[0].chapters[0].chapterId).toBeNull();
  });
  it("does not match a major rewrite merely because its title and position are unchanged", () => {
    const result = matchCourseUpdate(plan([{ title: "Checkout", lessons: [lesson("Payments", deployment)] }]), modules, [chapter("payment", "a", lesson("Payments", payment))]);
    expect(result.mapping[0].chapters[0].chapterId).toBeNull();
    expect(result.modules[0].chapters.some(c => c.action === "removed" && c.title === "Payments")).toBe(true);
  });
  it("ignores generated block IDs but compares activity configuration and punctuation edits", () => {
    const old = lesson("Question", '<Quiz id="01ARZ3NDEKTSV4RRFFQ69G5FAV" />');
    old.blocks = [{ id: "01ARZ3NDEKTSV4RRFFQ69G5FAV", type: "QUIZ", required: true, config: { question: payment } }];
    const next = { ...old, source: '<Quiz id="01ARZ3NDEKTSV4RRFFQ69G5FAW" />', blocks: [{ ...old.blocks[0], id: "01ARZ3NDEKTSV4RRFFQ69G5FAW" }] };
    const previous = chapter("q", "a", old);
    expect(chapterSimilarity(next, previous)).toBe(1);
    expect(matchCourseUpdate(plan([{ title: "Checkout", lessons: [next] }]), modules, [previous]).modules[0].chapters[0].action).toBe("unchanged");
    const text = lesson("Payments", payment);
    const edit = { ...text, source: payment.replace("customer.", "customer!") };
    expect(matchCourseUpdate(plan([{ title: "Checkout", lessons: [edit] }]), modules, [chapter("p", "a", text)]).modules[0].chapters[0].action).toBe("changed");
  });
  it("does not give empty text a perfect similarity score", () => {
    expect(textSimilarity("", "")).toBe(0);
  });
});
