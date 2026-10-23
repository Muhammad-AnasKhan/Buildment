import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { Prisma } from "../../src/generated/prisma/index.js";
import { createSession } from "../../src/services/auth/session.js";
import { findCourseFamily } from "../../src/shared/lib/course-tracks.js";
import { createCourseFixture } from "../helpers/fixtures.js";

const app = createApp();
const family = findCourseFamily("multi-vendor-marketplace")!;
let fx: Awaited<ReturnType<typeof createCourseFixture>>;
let mentorToken: string;
const userIds: string[] = [];

beforeAll(async () => {
  fx = await createCourseFixture();
  await prisma.course.update({ where: { id: fx.course.id }, data: { familySlug: family.slug } });
  mentorToken = (await createSession(fx.mentor.id)).sessionToken;
});
afterAll(async () => {
  await prisma.enrollment.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await fx.cleanup();
});

async function newLearner() {
  const user = await prisma.user.create({ data: { email: `variant-${randomUUID()}@test.local`, name: "Learner", role: "MENTEE", emailVerified: new Date() } });
  userIds.push(user.id);
  const token = (await createSession(user.id)).sessionToken;
  return { user, auth: { Authorization: `Bearer ${token}` } };
}

async function enroll(auth: { Authorization: string }) {
  const response = await request(app).post("/api/v1/enrollments").set(auth).send({ courseId: fx.course.id });
  expect(response.status).toBe(201);
  return prisma.enrollment.findUniqueOrThrow({ where: { id: response.body.data.enrollmentId } });
}

describe("variant assignment on new enrollment", () => {
  it("defaults to learner choice and locks an automatic pick immediately", async () => {
    const self = await newLearner();
    const selfEnrollment = await enroll(self.auth);
    expect(selfEnrollment.variantSlug).toBeNull();

    await prisma.course.update({ where: { id: fx.course.id }, data: { variantAssignment: "RANDOM" } });
    const assigned = await newLearner();
    const row = await enroll(assigned.auth);
    expect(family.variants.map(variant => variant.slug)).toContain(row.variantSlug);
    expect(row.variantAssignedAt).toBeInstanceOf(Date);
    expect(row.variantLockedAt).toBeInstanceOf(Date);

    const overview = await request(app).get(`/api/v1/courses/${fx.course.slug}/overview`).set(assigned.auth);
    expect(overview.body.data.track).toMatchObject({ variantSlug: row.variantSlug, variantAssigned: true, variantLocked: true });
    const other = family.variants.find(variant => variant.slug !== row.variantSlug)!;
    const switchAttempt = await request(app).put(`/api/v1/courses/${fx.course.slug}/track/variant`).set(assigned.auth).send({ variantSlug: other.slug });
    expect(switchAttempt.status).toBe(409);

    // A policy change never edits an enrollment that already existed.
    const existingOverview = await request(app).get(`/api/v1/courses/${fx.course.slug}/overview`).set(self.auth);
    expect(existingOverview.body.data.track).toMatchObject({ variantChosen: false, variantAssigned: false });
    expect((await prisma.enrollment.findUniqueOrThrow({ where: { id: selfEnrollment.id } })).variantSlug).toBeNull();
  });

  it("spreads new learners across variants and preserves assignments after mode changes", async () => {
    const created = [];
    for (let i = 0; i < family.variants.length - 1; i += 1) created.push(await enroll((await newLearner()).auth));
    const assigned = await prisma.enrollment.findMany({ where: { courseId: fx.course.id, variantAssignedAt: { not: null } }, select: { variantSlug: true } });
    expect(new Set(assigned.map(row => row.variantSlug)).size).toBe(family.variants.length);
    await prisma.course.update({ where: { id: fx.course.id }, data: { variantAssignment: "SELF_SELECT" } });
    const saved = await prisma.enrollment.findUniqueOrThrow({ where: { id: created[0]!.id } });
    expect(saved.variantSlug).toBe(created[0]!.variantSlug);
    expect(saved.variantAssignedAt).toBeInstanceOf(Date);
  });

  it("uses creator-defined variants and assigns mentor-added learners", async () => {
    const custom = { ...family, slug: `custom-${randomUUID()}`, variants: family.variants.slice(0, 2), defaultVariantSlug: family.variants[0]!.slug };
    await prisma.course.update({ where: { id: fx.course.id }, data: { familySlug: custom.slug, variantFamily: custom, variantAssignment: "RANDOM" } });
    try {
      const { user } = await newLearner();
      const result = await request(app).post(`/api/v1/teach/courses/${fx.course.id}/invites/assign`).set({ Authorization: `Bearer ${mentorToken}` }).send({ emails: user.email });
      expect(result.status).toBe(200);
      const row = await prisma.enrollment.findFirstOrThrow({ where: { courseId: fx.course.id, userId: user.id } });
      expect(custom.variants.map(variant => variant.slug)).toContain(row.variantSlug);
      expect(row.variantAssignedAt).toBeInstanceOf(Date);
    } finally {
      await prisma.course.update({ where: { id: fx.course.id }, data: { familySlug: family.slug, variantFamily: Prisma.DbNull, variantAssignment: "SELF_SELECT" } });
    }
  });
});

describe("course assignment setting", () => {
  const payload = (variantAssignment: string) => ({
    title: fx.course.title, description: "", coverUrl: "", projectGoal: "", difficulty: "",
    estimatedHours: "", sequential: true, pricingType: "FREE", priceDollars: "", currency: "USD",
    variantAssignment,
  });
  const patch = (mode: string) => request(app).patch(`/api/v1/teach/courses/${fx.course.id}/settings`)
    .set({ Authorization: `Bearer ${mentorToken}` }).send(payload(mode));

  it("lets the course creator turn on assignment for a variant course", async () => {
    expect((await patch("RANDOM")).status).toBe(204);
    const view = await request(app).get(`/api/v1/teach/courses/${fx.course.slug}/settings`)
      .set({ Authorization: `Bearer ${mentorToken}` });
    expect(view.body.data).toMatchObject({ variantAssignment: "RANDOM", hasVariants: true });
    expect((await patch("UNKNOWN")).status).toBe(400);
  });

  it("rejects assignment when the course has no variants", async () => {
    await prisma.course.update({ where: { id: fx.course.id }, data: { familySlug: null, variantFamily: Prisma.DbNull } });
    try {
      expect((await patch("RANDOM")).status).toBe(422);
    } finally {
      await prisma.course.update({ where: { id: fx.course.id }, data: { familySlug: family.slug, variantAssignment: "SELF_SELECT" } });
    }
  });
});
