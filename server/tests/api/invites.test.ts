import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { createCourseFixture } from "../helpers/fixtures.js";

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;
const tokens = { open: "", bound: "", expired: "" };

beforeAll(async () => {
  fx = await createCourseFixture();
  // The fixture learner is already enrolled; accept with the (now verified) spare user instead.
  await prisma.enrollment.deleteMany({ where: { courseId: fx.course.id, userId: fx.unverified.id } });
  const mk = (token: string, extra: Record<string, unknown> = {}) =>
    prisma.invite.create({ data: { token, courseId: fx.course.id, invitedById: fx.mentor.id, expiresAt: new Date(Date.now() + 86_400_000), ...extra } });
  tokens.open = `inv-open-${fx.tag}`;
  tokens.bound = `inv-bound-${fx.tag}`;
  tokens.expired = `inv-expired-${fx.tag}`;
  await mk(tokens.open);
  await mk(tokens.bound, { email: "someone-else@test.local" });
  await mk(tokens.expired, { expiresAt: new Date(Date.now() - 1000) });
});
afterAll(async () => {
  await prisma.invite.deleteMany({ where: { courseId: fx.course.id } });
  await fx.cleanup();
});

const accept = (token: string, who = fx.unverifiedToken, body: object = {}) =>
  request(app).post(`/api/v1/invites/${token}/accept`).set({ Authorization: `Bearer ${who}` }).send(body);

describe("/api/v1/invites", () => {
  it("describes an invite publicly and 404s unknown tokens", async () => {
    const res = await request(app).get(`/api/v1/invites/${tokens.open}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ state: "valid", email: null, course: { slug: fx.course.slug, mentorName: "Test Mentor" } });
    expect((await request(app).get(`/api/v1/invites/${tokens.expired}`)).body.data.state).toBe("expired");
    expect((await request(app).get("/api/v1/invites/nope")).status).toBe(404);
  });

  it("refuses expired invites and invites bound to another address", async () => {
    const expired = await accept(tokens.expired);
    expect(expired.status).toBe(409);
    expect(expired.body.code).toBe("INVITE_EXPIRED");
    const wrong = await accept(tokens.bound);
    expect(wrong.status).toBe(403);
    expect(wrong.body.code).toBe("WRONG_ACCOUNT");
  });

  it("accepts once, enrolling the learner and recording the name", async () => {
    expect((await request(app).post(`/api/v1/invites/${tokens.open}/accept`).send({})).status).toBe(401);
    const res = await accept(tokens.open, fx.unverifiedToken, { name: "Invited Learner" });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ courseSlug: fx.course.slug, checkoutRequired: false });

    const enrollment = await prisma.enrollment.findUnique({ where: { courseId_userId: { courseId: fx.course.id, userId: fx.unverified.id } } });
    expect(enrollment).toMatchObject({ source: "INVITE", lifecycle: "ACTIVE", status: "IN_PROGRESS" });
    expect((await prisma.user.findUniqueOrThrow({ where: { id: fx.unverified.id } })).name).toBe("Invited Learner");

    const again = await accept(tokens.open);
    expect(again.body.code).toBe("INVITE_ACCEPTED");
    expect((await request(app).get(`/api/v1/invites/${tokens.open}`)).body.data.state).toBe("accepted");
  });
});
