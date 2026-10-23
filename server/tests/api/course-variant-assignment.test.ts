import { randomBytes, randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { createSession } from "../../src/services/auth/session.js";
import { findCourseFamily } from "../../src/shared/lib/course-tracks.js";
import { createCourseFixture } from "../helpers/fixtures.js";

// How learners get a variant in a course family: they pick it (SELF_SELECT, the
// default), or the platform assigns one at enrolment (RANDOM), balanced across
// the variants, and the learner cannot change it.

const app = createApp();
const FAMILY = "multi-vendor-marketplace";
const variantCount = findCourseFamily(FAMILY)!.variants.length;
let fx: Awaited<ReturnType<typeof createCourseFixture>>;
let mentorToken = "";
const extraUserIds: string[] = [];

beforeAll(async () => {
  fx = await createCourseFixture();
  await prisma.course.update({ where: { id: fx.course.id }, data: { familySlug: FAMILY } });
  mentorToken = (await createSession(fx.mentor.id)).sessionToken;
});
afterAll(async () => {
  await prisma.enrollment.deleteMany({ where: { userId: { in: extraUserIds } } });
  await prisma.session.deleteMany({ where: { userId: { in: extraUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: extraUserIds } } });
  await fx.cleanup();
});

const mentor = () => ({ Authorization: `Bearer ${mentorToken}` });
const setAssignment = (variantAssignment: "SELF_SELECT" | "RANDOM") =>
  prisma.course.update({ where: { id: fx.course.id }, data: { variantAssignment } });

async function newLearner() {
  const user = await prisma.user.create({
    data: { email: `assign-${randomUUID().slice(0, 8)}@test.local`, name: "Learner", role: "MENTEE", emailVerified: new Date() },
  });
  extraUserIds.push(user.id);
  const { sessionToken } = await createSession(user.id, randomBytes(32).toString("hex"));
  return { user, auth: { Authorization: `Bearer ${sessionToken}` } };
}

async function enrol(auth: { Authorization: string }) {
  const res = await request(app).post("/api/v1/enrollments").set(auth).send({ courseId: fx.course.id });
  expect(res.status).toBe(201);
  return prisma.enrollment.findUniqueOrThrow({ where: { id: res.body.data.enrollmentId } });
}

async function variantCounts() {
  const groups = await prisma.enrollment.groupBy({
    by: ["variantSlug"],
    where: { courseId: fx.course.id, variantSlug: { not: null } },
    _count: { _all: true },
  });
  return Object.fromEntries(groups.map((group) => [group.variantSlug!, group._count._all]));
}

const chooseVariant = (variantSlug: string, auth: { Authorization: string }) =>
  request(app).put(`/api/v1/courses/${fx.course.slug}/track/variant`).set(auth).send({ variantSlug });

describe("random variant assignment", () => {
  it("assigns every new enrolment a variant, spread evenly across the family", async () => {
    await setAssignment("RANDOM");
    for (let i = 0; i < variantCount * 2; i += 1) {
      const enrollment = await enrol((await newLearner()).auth);
      expect(enrollment.variantSlug).toBeTruthy();
      expect(enrollment.variantChosenAt).toBeInstanceOf(Date);
    }
    const counts = await variantCounts();
    expect(Object.keys(counts)).toHaveLength(variantCount);
    expect(Object.values(counts).every((count) => count === 2)).toBe(true);
  });

  it("shows the variant as assigned and refuses a switch", async () => {
    const { user, auth } = await newLearner();
    const enrollment = await enrol(auth);

    const overview = await request(app).get(`/api/v1/courses/${fx.course.slug}/overview`).set(auth);
    expect(overview.status).toBe(200);
    expect(overview.body.data.track).toMatchObject({ variantSlug: enrollment.variantSlug, variantChosen: true, variantAssigned: true });
    const reader = await request(app).get(`/api/v1/courses/${fx.course.slug}/chapters/chapter-a`).set(auth);
    expect(reader.body.data.track).toMatchObject({ variantSlug: enrollment.variantSlug, variantAssigned: true });

    const other = findCourseFamily(FAMILY)!.variants.find((variant) => variant.slug !== enrollment.variantSlug)!;
    const res = await chooseVariant(other.slug, auth);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe("VARIANT_ASSIGNED_BY_PLATFORM");
    const stored = await prisma.enrollment.findUniqueOrThrow({ where: { courseId_userId: { courseId: fx.course.id, userId: user.id } } });
    expect(stored.variantSlug).toBe(enrollment.variantSlug);
  });

  it("assigns a variant when the mentor enrols a learner by email", async () => {
    const { user } = await newLearner();
    const res = await request(app).post(`/api/v1/teach/courses/${fx.course.id}/invites/assign`).set(mentor()).send({ emails: user.email });
    expect(res.status).toBe(200);
    const enrollment = await prisma.enrollment.findFirstOrThrow({ where: { courseId: fx.course.id, userId: user.id } });
    expect(enrollment.variantSlug).toBeTruthy();
  });

  it("lets the course mentor switch, so they can preview every variant", async () => {
    const res = await chooseVariant("books", mentor());
    expect(res.status).toBe(200);
    expect(res.body.data.track).toMatchObject({ variantSlug: "books", variantAssigned: false });
  });

  it("gives a variant to an enrolment from before the switch, unless the learner has started", async () => {
    // The fixture learner enrolled before the course switched to RANDOM.
    expect((await prisma.enrollment.findUniqueOrThrow({ where: { id: fx.enrollment.id } })).variantSlug).toBeNull();
    const overview = await request(app).get(`/api/v1/courses/${fx.course.slug}/overview`).set({ Authorization: `Bearer ${fx.learnerToken}` });
    expect(overview.body.data.track).toMatchObject({ variantChosen: true, variantAssigned: true });
    expect((await prisma.enrollment.findUniqueOrThrow({ where: { id: fx.enrollment.id } })).variantSlug).toBe(overview.body.data.track.variantSlug);

    const { user, auth } = await newLearner();
    await prisma.enrollment.create({
      data: { courseId: fx.course.id, userId: user.id, lifecycle: "ACTIVE", status: "IN_PROGRESS", chaptersCompleted: 1, percentComplete: 50 },
    });
    const started = await request(app).get(`/api/v1/courses/${fx.course.slug}/overview`).set(auth);
    expect(started.body.data.track).toMatchObject({ variantSlug: "grocery", variantChosen: false, variantAssigned: true });
    expect((await prisma.enrollment.findFirstOrThrow({ where: { userId: user.id } })).variantSlug).toBeNull();
  });

  it("keeps the variant a learner picked before the course switched", async () => {
    await setAssignment("SELF_SELECT");
    const { auth } = await newLearner();
    await enrol(auth);
    expect((await chooseVariant("handmade", auth)).status).toBe(200);

    await setAssignment("RANDOM");
    const overview = await request(app).get(`/api/v1/courses/${fx.course.slug}/overview`).set(auth);
    expect(overview.body.data.track).toMatchObject({ variantSlug: "handmade", variantAssigned: true });
  });
});

describe("self-select variant assignment", () => {
  it("leaves the pick to the learner", async () => {
    await setAssignment("SELF_SELECT");
    const { auth } = await newLearner();
    const enrollment = await enrol(auth);
    expect(enrollment.variantSlug).toBeNull();

    const overview = await request(app).get(`/api/v1/courses/${fx.course.slug}/overview`).set(auth);
    expect(overview.body.data.track).toMatchObject({ variantChosen: false, variantAssigned: false });
    expect((await chooseVariant("services", auth)).status).toBe(200);
  });
});

describe("course settings", () => {
  const settings = (variantAssignment?: string) => ({
    title: fx.course.title,
    description: "",
    coverUrl: "",
    projectGoal: "",
    difficulty: "",
    estimatedHours: "",
    sequential: true,
    pricingType: "FREE",
    priceDollars: "",
    currency: "USD",
    ...(variantAssignment ? { variantAssignment } : {}),
  });
  const patch = (body: object) => request(app).patch(`/api/v1/teach/courses/${fx.course.id}/settings`).set(mentor()).send(body);
  const stored = async () => (await prisma.course.findUniqueOrThrow({ where: { id: fx.course.id } })).variantAssignment;

  it("lets the mentor switch the mode, and leaves it alone when omitted", async () => {
    expect((await patch(settings("RANDOM"))).status).toBe(204);
    expect(await stored()).toBe("RANDOM");
    const view = await request(app).get(`/api/v1/teach/courses/${fx.course.slug}/settings`).set(mentor());
    expect(view.body.data).toMatchObject({ familySlug: FAMILY, variantAssignment: "RANDOM" });

    expect((await patch(settings())).status).toBe(204);
    expect(await stored()).toBe("RANDOM");

    expect((await patch(settings("SELF_SELECT"))).status).toBe(204);
    expect(await stored()).toBe("SELF_SELECT");
  });

  it("rejects unknown modes, learners, and random on a course without a family", async () => {
    expect((await patch(settings("ROUND_ROBIN"))).status).toBe(400);
    const learner = await request(app)
      .patch(`/api/v1/teach/courses/${fx.course.id}/settings`)
      .set({ Authorization: `Bearer ${fx.learnerToken}` })
      .send(settings("RANDOM"));
    expect(learner.status).toBe(403);

    await prisma.course.update({ where: { id: fx.course.id }, data: { familySlug: null } });
    try {
      expect((await patch(settings("RANDOM"))).status).toBe(422);
      expect(await stored()).toBe("SELF_SELECT");
    } finally {
      await prisma.course.update({ where: { id: fx.course.id }, data: { familySlug: FAMILY } });
    }
  });
});
