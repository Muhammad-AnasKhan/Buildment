import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { createCourseFixture } from "../helpers/fixtures.js";

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;

beforeAll(async () => {
  fx = await createCourseFixture();
});
afterAll(() => fx.cleanup());

const auth = (token = fx.learnerToken) => ({ Authorization: `Bearer ${token}` });

describe("study timer", () => {
  it("requires a session", async () => {
    const res = await request(app).get("/api/v1/progress/session").query({ chapterId: fx.chapterA.id });
    expect(res.status).toBe(401);
  });

  it("starts idle, runs after start, credits heartbeats, and ends", async () => {
    const idle = await request(app).get("/api/v1/progress/session").query({ chapterId: fx.chapterA.id }).set(auth());
    expect(idle.body.data).toEqual({ status: "idle", activeSeconds: 0, chapterTimeSpentSeconds: 0 });

    const started = await request(app).post("/api/v1/progress/session").set(auth()).send({ chapterId: fx.chapterA.id, action: "start" });
    expect(started.body.data.status).toBe("running");

    const beat = await request(app).post("/api/v1/progress/heartbeat").set(auth()).send({ chapterId: fx.chapterA.id, deltaSeconds: 15 });
    expect(beat.status).toBe(200);
    expect(beat.body.data.creditedSeconds).toBe(15);
    expect(beat.body.data.chapterTimeSpentSeconds).toBe(15);

    const ended = await request(app).post("/api/v1/progress/session").set(auth()).send({ chapterId: fx.chapterA.id, action: "end", deltaSeconds: 5 });
    expect(ended.body.data).toMatchObject({ status: "idle", activeSeconds: 0, chapterTimeSpentSeconds: 20 });
  });

  it("rejects heartbeats larger than the client cadence allows", async () => {
    const res = await request(app).post("/api/v1/progress/heartbeat").set(auth()).send({ chapterId: fx.chapterA.id, deltaSeconds: 999 });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe("deltaSeconds");
  });

  it("403s users who are not enrolled", async () => {
    const res = await request(app).post("/api/v1/progress/heartbeat").set(auth(fx.unverifiedToken)).send({ chapterId: fx.chapterA.id });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/v1/courses/:courseSlug/continue", () => {
  it("points at the first unfinished chapter", async () => {
    const res = await request(app).get(`/api/v1/courses/${fx.course.slug}/continue`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data.href).toBe(`/courses/${fx.course.slug}/chapter-a`);
  });

  it("404s unknown courses and 401s anonymous callers", async () => {
    expect((await request(app).get("/api/v1/courses/nope/continue")).status).toBe(404);
    expect((await request(app).get(`/api/v1/courses/${fx.course.slug}/continue`)).status).toBe(401);
  });
});
