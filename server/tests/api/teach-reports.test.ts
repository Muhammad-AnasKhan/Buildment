import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { createSession } from "../../src/services/auth/session.js";
import { createCourseFixture } from "../helpers/fixtures.js";

// Course insights: the report page model, its CSV export and the activity grid.

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;
let mentorToken = "";

beforeAll(async () => {
  fx = await createCourseFixture();
  mentorToken = (await createSession(fx.mentor.id)).sessionToken;
  // One quiz answer so the chapter report has attempts and a learner row.
  await request(app).post(`/api/v1/blocks/${fx.quizBlock.id}/respond`).set("Authorization", `Bearer ${fx.learnerToken}`).send({ selected: ["b"] });
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  await prisma.dailyActivity.create({ data: { enrollmentId: fx.enrollment.id, date: today, activeSeconds: 900 } });
});
afterAll(() => fx.cleanup());

const mentor = () => ({ Authorization: `Bearer ${mentorToken}` });

describe("GET /api/v1/teach/courses/:courseSlug/reports", () => {
  it("summarises the cohort and lists learners", async () => {
    const res = await request(app).get(`/api/v1/teach/courses/${fx.course.slug}/reports`).set(mentor());
    expect(res.status).toBe(200);
    expect(res.body.data.summary).toMatchObject({ enrolled: 1, started: 1, completed: 0 });
    expect(res.body.data.modules[0].chapters.map((c: { title: string }) => c.title)).toEqual(["Chapter A", "Chapter B"]);
    expect(res.body.data.enrollments[0]).toMatchObject({ id: fx.enrollment.id, email: fx.learner.email, status: "IN_PROGRESS", atRisk: false });
    expect(res.body.data.chapterReport).toBeNull();
  });

  it("adds the chapter report when a chapter of this course is selected", async () => {
    const res = await request(app).get(`/api/v1/teach/courses/${fx.course.slug}/reports?chapterId=${fx.chapterA.id}`).set(mentor());
    expect(res.status).toBe(200);
    const report = res.body.data.chapterReport;
    expect(report.chapterId).toBe(fx.chapterA.id);
    expect(report.blocks.map((b: { id: string }) => b.id)).toEqual([fx.quizBlock.id, fx.mustReadBlock.id]);
    expect(report.blocks[0]).toMatchObject({ type: "QUIZ", attempts: 1, correctRate: 0, confusionFlag: false });
    expect(report.blocks[1]).toMatchObject({ type: "MUST_READ", correctRate: null });
    expect(report.progress).toHaveLength(1);
    expect(report.progress[0]).toMatchObject({ learnerLabel: "Test Learner", blocksTotal: 2 });

    const foreign = await request(app).get(`/api/v1/teach/courses/${fx.course.slug}/reports?chapterId=nope`).set(mentor());
    expect(foreign.body.data.chapterReport).toBeNull();
  });

  it("exports the mentee table as CSV", async () => {
    const res = await request(app).get(`/api/v1/teach/courses/${fx.course.slug}/reports/export`).set(mentor());
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/csv/);
    expect(res.headers["content-disposition"]).toContain(`${fx.course.slug}-report.csv`);
    const lines = res.text.split("\n");
    expect(lines[0]).toBe("name,email,status,percent_complete,chapters_completed,score,max_score,pending_reviews,last_active_at,started_at,completed_at");
    expect(lines[1]).toMatch(new RegExp(`^Test Learner,${fx.learner.email},IN_PROGRESS,`));

    expect((await request(app).get(`/api/v1/teach/courses/${fx.course.slug}/reports/export`).set("Authorization", `Bearer ${fx.learnerToken}`)).status).toBe(403);
  });
});

describe("GET /api/v1/teach/courses/:courseSlug/activity", () => {
  it("builds a 14-day grid of study seconds per learner", async () => {
    const res = await request(app).get(`/api/v1/teach/courses/${fx.course.slug}/activity`).set(mentor());
    expect(res.status).toBe(200);
    expect(res.body.data.days).toHaveLength(14);
    expect(res.body.data.rows).toHaveLength(1);
    const row = res.body.data.rows[0];
    expect(row).toMatchObject({ enrollmentId: fx.enrollment.id, label: "Test Learner", totalSeconds: 900 });
    expect(row.seconds).toHaveLength(14);
    expect(row.seconds[13]).toBe(900);
    expect(res.body.data.metrics).toMatchObject({ learnerCount: 1, activeLearners: 1, totalSeconds: 900, averageSeconds: 900, todaySeconds: 900 });
    expect(res.body.data.hasActivity).toBe(true);
  });
});
