import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { completeChapter, createCourseFixture } from "../helpers/fixtures.js";

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;

beforeAll(async () => {
  fx = await createCourseFixture();
});
afterAll(() => fx.cleanup());

const auth = (token = fx.learnerToken) => ({ Authorization: `Bearer ${token}` });

describe("/api/v1/learner", () => {
  it("requires a session, and activates unverified accounts when email delivery is off", async () => {
    expect((await request(app).get("/api/v1/learner/workspace")).status).toBe(401);
    // Tests run without AUTH_RESEND_KEY, so the verified gate auto-activates instead of refusing.
    const unverified = await request(app).get("/api/v1/learner/workspace").set(auth(fx.unverifiedToken));
    expect(unverified.status).toBe(200);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: fx.unverified.id } });
    expect(user.emailVerified).toBeInstanceOf(Date);
  });

  it("returns workspace counts and instructor-access state", async () => {
    const res = await request(app).get("/api/v1/learner/workspace").set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      instructorAccess: { role: "MENTEE", requestStatus: "none", canRequestAccess: true },
      assignedCourses: 1,
      pendingReviews: 0,
      openHelpRequests: 0,
    });
  });

  it("builds the dashboard view model for the learner's enrollments", async () => {
    const res = await request(app).get("/api/v1/learner/dashboard").set(auth());
    expect(res.status).toBe(200);
    const model = res.body.data;
    expect(model.learner.name).toBe("Test Learner");
    expect(model.courses).toHaveLength(1);
    expect(model.courses[0]).toMatchObject({ slug: fx.course.slug, chaptersTotal: 2, state: "IN_PROGRESS" });
    expect(model.habit).toMatchObject({ streakCount: 0, weeklyGoal: null });
  });

  it("reports progress per course and overall", async () => {
    await completeChapter(fx.enrollment.id, fx.chapterA.id);
    const res = await request(app).get("/api/v1/learner/progress").set(auth());
    expect(res.status).toBe(200);
    const view = res.body.data;
    expect(view.courses).toHaveLength(1);
    expect(view.courses[0]).toMatchObject({ course: { slug: fx.course.slug }, totalChapters: 2 });
    expect(view.courses[0].modules[0]).toMatchObject({ title: "Module 1", completed: 1, total: 2 });
    expect(view.courses[0].continueHref).toBe(`/courses/${fx.course.slug}/chapter-b`);
    expect(view.overall.totalChapters).toBe(2);
    expect(view.closedWrong).toEqual([]);
  });

  it("sets, reflects and clears the weekly goal", async () => {
    const bad = await request(app).put("/api/v1/learner/weekly-goal").set(auth()).send({ kind: "SESSIONS", target: 99 });
    expect(bad.status).toBe(400);

    expect((await request(app).put("/api/v1/learner/weekly-goal").set(auth()).send({ kind: "CHAPTERS", target: 3 })).status).toBe(204);
    const dashboard = await request(app).get("/api/v1/learner/dashboard").set(auth());
    expect(dashboard.body.data.habit.weeklyGoal).toEqual({ kind: "CHAPTERS", target: 3, progress: 1, note: null, dailyReminder: false });

    expect((await request(app).delete("/api/v1/learner/weekly-goal").set(auth())).status).toBe(204);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: fx.learner.id } });
    expect(user.weeklyGoalKind).toBeNull();
  });

  it("records celebrated streak milestones cumulatively", async () => {
    expect((await request(app).post("/api/v1/learner/streak-milestones/5/acknowledge").set(auth())).status).toBe(400);
    expect((await request(app).post("/api/v1/learner/streak-milestones/7/acknowledge").set(auth())).status).toBe(204);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: fx.learner.id } });
    expect([...user.celebratedStreakMilestones].sort()).toEqual([3, 7]);
  });
});
