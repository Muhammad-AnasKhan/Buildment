import { describe, expect, it } from "vitest";
import { buildMenteeDashboardViewModel } from "./dashboard-model";
import type {
  DashboardEnrollmentInput,
  DashboardHelpInput,
  DashboardResponseInput,
  DashboardSessionInput,
} from "./dashboard-model";

const now = new Date("2026-09-23T12:00:00.000Z");
const week = [
  { day: "2026-09-17", seconds: 0 },
  { day: "2026-09-18", seconds: 0 },
  { day: "2026-09-19", seconds: 0 },
  { day: "2026-09-20", seconds: 0 },
  { day: "2026-09-21", seconds: 0 },
  { day: "2026-09-22", seconds: 0 },
  { day: "2026-09-23", seconds: 0 },
];

function enrollment(overrides: Partial<DashboardEnrollmentInput> = {}): DashboardEnrollmentInput {
  const id = overrides.id ?? "enrollment-1";
  const slug = overrides.course?.slug ?? `course-${id}`;
  return {
    id,
    status: "IN_PROGRESS",
    percentComplete: 25,
    chaptersCompleted: 0,
    totalScore: 2,
    maxScore: 4,
    pendingReviews: 0,
    lastActiveAt: now,
    startedAt: now,
    completedAt: null,
    createdAt: now,
    course: {
      id: `course-id-${id}`,
      slug,
      title: overrides.course?.title ?? `Course ${id}`,
      coverUrl: null,
      sequential: true,
      modules: [{
        id: `module-${id}`,
        order: 1,
        title: "Foundations",
        chapters: [
          { id: `chapter-a-${id}`, slug: "chapter-a", title: "Chapter A", order: 1, blocks: [{ type: "QUIZ", required: true, archivedAt: null }] },
          { id: `chapter-b-${id}`, slug: "chapter-b", title: "Chapter B", order: 2, blocks: [{ type: "QUIZ", required: true, archivedAt: null }] },
        ],
      }],
    },
    chapterProgress: [
      { chapterId: `chapter-a-${id}`, status: "IN_PROGRESS", blocksCompleted: 0, blocksTotal: 1, timeSpentSeconds: 120, startedAt: now, completedAt: null },
    ],
    ...overrides,
  };
}

function response(args: { enrollmentId?: string; status?: DashboardResponseInput["status"]; attempt?: number; verdict?: "APPROVED" | "NEEDS_REVISION" }): DashboardResponseInput {
  const enrollmentId = args.enrollmentId ?? "enrollment-1";
  const verdict = args.verdict;
  return {
    id: `response-${args.attempt ?? 1}-${enrollmentId}`,
    blockId: `block-${enrollmentId}`,
    enrollmentId,
    attempt: args.attempt ?? 1,
    status: args.status ?? "PENDING_REVIEW",
    submittedAt: now,
    review: verdict ? { feedback: verdict === "NEEDS_REVISION" ? "Clarify the architecture." : "Well explained.", verdict, createdAt: now } : null,
    block: { chapter: { id: `chapter-a-${enrollmentId}`, slug: "chapter-a", title: "Chapter A", course: { slug: `course-${enrollmentId}`, title: `Course ${enrollmentId}` } } },
  };
}

function build(overrides: Partial<Parameters<typeof buildMenteeDashboardViewModel>[0]> = {}) {
  return buildMenteeDashboardViewModel({
    learnerName: "Aqib",
    enrollments: [enrollment()],
    responses: [],
    helpThreads: [],
    sessions: [],
    week,
    todayKey: "2026-09-23",
    ...overrides,
  });
}

describe("buildMenteeDashboardViewModel", () => {
  it("selects a needs-revision course before a running course", () => {
    const revisionCourse = enrollment({ id: "revision", course: { ...enrollment().course, id: "revision-course", slug: "course-revision", title: "Revision course" } });
    const runningCourse = enrollment({ id: "running", course: { ...enrollment().course, id: "running-course", slug: "course-running", title: "Running course" } });
    const running: DashboardSessionInput = { id: "session", enrollmentId: "running", status: "RUNNING", startedAt: now, endedAt: null, activeSeconds: 12, updatedAt: now, chapter: { slug: "chapter-a", title: "Chapter A" }, enrollment: { course: { slug: "course-running", title: "Running course" } } };
    const model = build({ enrollments: [runningCourse, revisionCourse], responses: [response({ enrollmentId: "revision", status: "NEEDS_REVISION", verdict: "NEEDS_REVISION" })], sessions: [running] });
    expect(model.primaryCourse?.id).toBe("revision");
    expect(model.primaryCourse?.actionLabel).toContain("Revise");
  });

  it("selects active running work when no revision exists", () => {
    const first = enrollment({ id: "first", lastActiveAt: new Date("2026-09-23T11:00:00Z") });
    const runningCourse = enrollment({ id: "running", lastActiveAt: new Date("2026-09-20T11:00:00Z") });
    const running = { id: "session", enrollmentId: "running", status: "RUNNING", startedAt: now, endedAt: null, activeSeconds: 12, updatedAt: now, chapter: { slug: "chapter-a", title: "Chapter A" }, enrollment: { course: { slug: "course-running", title: "Running" } } } satisfies DashboardSessionInput;
    expect(build({ enrollments: [first, runningCourse], sessions: [running] }).primaryCourse?.id).toBe("running");
  });

  it("produces a Start action for an assigned, unstarted course", () => {
    const unstarted = enrollment({ status: "ASSIGNED", percentComplete: 0, startedAt: null, lastActiveAt: null, chapterProgress: [] });
    const model = build({ enrollments: [unstarted] });
    expect(model.primaryCourse?.state).toBe("NOT_STARTED");
    expect(model.primaryCourse?.actionLabel).toBe("Start Chapter A");
  });

  it("never selects a locked chapter as the continue destination", () => {
    const locked = enrollment({ chapterProgress: [{ chapterId: "chapter-a-enrollment-1", status: "IN_PROGRESS", blocksCompleted: 0, blocksTotal: 1, timeSpentSeconds: 0, startedAt: now, completedAt: null }, { chapterId: "chapter-b-enrollment-1", status: "IN_PROGRESS", blocksCompleted: 0, blocksTotal: 1, timeSpentSeconds: 0, startedAt: now, completedAt: null }] });
    const model = build({ enrollments: [locked] });
    expect(model.primaryCourse?.targetChapter?.slug).toBe("chapter-a");
    expect(model.primaryCourse?.href).not.toContain("chapter-b");
  });

  it("offers Review for a completed course", () => {
    const completed = enrollment({ status: "COMPLETED", percentComplete: 100, chaptersCompleted: 2, completedAt: now });
    expect(build({ enrollments: [completed] }).primaryCourse?.actionLabel).toBe("Review completed course");
  });

  it("uses enrollment and chapter-progress rollups for summaries", () => {
    const model = build({ enrollments: [enrollment({ chaptersCompleted: 1, pendingReviews: 2, chapterProgress: [{ chapterId: "chapter-a-enrollment-1", status: "COMPLETED", blocksCompleted: 1, blocksTotal: 1, timeSpentSeconds: 360, startedAt: now, completedAt: now }] })] });
    expect(model.overview.chaptersCompleted).toBe(1);
    expect(model.overview.totalSeconds).toBe(360);
    expect(model.overview.pendingReviews).toBe(2);
  });

  it("handles zero weekly and total activity", () => {
    const model = build({ enrollments: [enrollment({ chapterProgress: [] })] });
    expect(model.overview.weekSeconds).toBe(0);
    expect(model.overview.totalSeconds).toBe(0);
    expect(model.activity.activeDays).toBe(0);
    expect(model.activity.maxDaySeconds).toBe(1);
  });

  it("adds multiple-course totals correctly", () => {
    const a = enrollment({ id: "a", chaptersCompleted: 1, chapterProgress: [{ chapterId: "chapter-a-a", status: "COMPLETED", blocksCompleted: 1, blocksTotal: 1, timeSpentSeconds: 100, startedAt: now, completedAt: now }] });
    const b = enrollment({ id: "b", chaptersCompleted: 2, chapterProgress: [{ chapterId: "chapter-a-b", status: "COMPLETED", blocksCompleted: 1, blocksTotal: 1, timeSpentSeconds: 200, startedAt: now, completedAt: now }] });
    const model = build({ enrollments: [a, b] });
    expect(model.overview.chaptersCompleted).toBe(3);
    expect(model.overview.totalSeconds).toBe(300);
    expect(model.overview.assignedCourses).toBe(2);
  });

  it("projects only the latest response without mutating attempts", () => {
    const older = response({ attempt: 1, status: "NEEDS_REVISION", verdict: "NEEDS_REVISION" });
    const newer = response({ attempt: 2, status: "PENDING_REVIEW" });
    const original = structuredClone([older, newer]);
    const model = build({ responses: [older, newer] });
    expect(model.actions.some((action) => action.kind === "REVISION")).toBe(false);
    expect(model.actions.some((action) => action.kind === "PENDING_REVIEW")).toBe(true);
    expect([older, newer]).toEqual(original);
  });

  it("keeps pending review distinct from needs revision", () => {
    const pendingModel = build({ responses: [response({ status: "PENDING_REVIEW" })] });
    const revisionModel = build({ responses: [response({ status: "NEEDS_REVISION", verdict: "NEEDS_REVISION" })] });
    expect(pendingModel.actions[0]?.kind).toBe("PENDING_REVIEW");
    expect(pendingModel.actions[0]?.reason).toContain("No resubmission");
    expect(revisionModel.actions[0]?.kind).toBe("REVISION");
  });

  it("returns a safe empty view model", () => {
    const model = build({ enrollments: [], responses: [], helpThreads: [], sessions: [] });
    expect(model.primaryCourse).toBeNull();
    expect(model.courses).toEqual([]);
    expect(model.recentEvents).toEqual([]);
  });

  it("handles a course with no published chapters", () => {
    const noChapters = enrollment({
      status: "ASSIGNED",
      percentComplete: 0,
      startedAt: null,
      chapterProgress: [],
      course: { ...enrollment().course, modules: [] },
    });
    const model = build({ enrollments: [noChapters] });
    expect(model.primaryCourse?.targetChapter).toBeNull();
    expect(model.primaryCourse?.href).toBe(`/courses/${noChapters.course.slug}`);
  });

  it("uses only supplied learner help threads and an authoritative open count", () => {
    const help: DashboardHelpInput = { id: "mine", status: "RESOLVED", createdAt: now, updatedAt: now, course: { slug: "course", title: "Course" }, chapter: null, messages: [] };
    const model = build({ helpThreads: [help], openHelpCount: 3 });
    expect(model.help.latest?.href).toBe("/my-questions/mine");
    expect(model.help.openCount).toBe(3);
  });

  it("never exposes mentor-only configuration keys in the client view model", () => {
    const json = JSON.stringify(build());
    for (const forbidden of ["config", "correct", "rubric", "sampleAnswer", "hiddenTests", "payload"]) expect(json).not.toContain(`\"${forbidden}\"`);
  });
});
