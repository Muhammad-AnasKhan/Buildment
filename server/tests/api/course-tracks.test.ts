import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { createSession } from "../../src/services/auth/session.js";
import { createCourseFixture } from "../helpers/fixtures.js";

// Variant and specialisation choices for a course in a family: what the learner
// sees, what they may change and when, and what their mentor sees.

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;
let mentorToken = "";

beforeAll(async () => {
  fx = await createCourseFixture();
  await prisma.course.update({ where: { id: fx.course.id }, data: { familySlug: "multi-vendor-marketplace" } });
  mentorToken = (await createSession(fx.mentor.id)).sessionToken;
});
afterAll(() => fx.cleanup());

const learner = () => ({ Authorization: `Bearer ${fx.learnerToken}` });
const mentor = () => ({ Authorization: `Bearer ${mentorToken}` });
const chooseVariant = (variantSlug: string, auth = learner()) =>
  request(app).put(`/api/v1/courses/${fx.course.slug}/track/variant`).set(auth).send({ variantSlug });
const chooseSpecialisation = (specialisationSlug: string) =>
  request(app).put(`/api/v1/courses/${fx.course.slug}/track/specialisation`).set(learner()).send({ specialisationSlug });
const setProgress = (percentComplete: number, status: "IN_PROGRESS" | "COMPLETED") =>
  prisma.enrollment.update({ where: { id: fx.enrollment.id }, data: { percentComplete, status } });

describe("course track", () => {
  it("defaults to the family's general variant until the learner picks", async () => {
    const overview = await request(app).get(`/api/v1/courses/${fx.course.slug}/overview`).set(learner());
    expect(overview.status).toBe(200);
    expect(overview.body.data.track).toEqual({
      familySlug: "multi-vendor-marketplace",
      variantSlug: "grocery",
      variantChosen: false,
      specialisationSlug: null,
      specialisationOpen: false,
    });
  });

  it("saves the variant and applies it to the reader", async () => {
    const res = await chooseVariant("books");
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ courseSlug: fx.course.slug, track: { variantSlug: "books", variantChosen: true } });

    const stored = await prisma.enrollment.findUniqueOrThrow({ where: { id: fx.enrollment.id } });
    expect(stored.variantSlug).toBe("books");
    expect(stored.variantChosenAt).toBeInstanceOf(Date);

    const reader = await request(app).get(`/api/v1/courses/${fx.course.slug}/chapters/chapter-a`).set(learner());
    expect(reader.status).toBe(200);
    expect(reader.body.data.track).toMatchObject({ variantSlug: "books", variantChosen: true });
  });

  it("rejects unknown variants, strangers and courses without a family", async () => {
    expect((await chooseVariant("cars")).status).toBe(400);
    expect((await request(app).put(`/api/v1/courses/${fx.course.slug}/track/variant`).send({ variantSlug: "books" })).status).toBe(401);
    const stranger = await chooseVariant("books", { Authorization: `Bearer ${fx.unverifiedToken}` });
    expect(stranger.status).toBe(403);

    await prisma.course.update({ where: { id: fx.course.id }, data: { familySlug: null } });
    try {
      const res = await chooseVariant("books");
      expect(res.status).toBe(409);
      expect(res.body.code).toBe("COURSE_HAS_NO_VARIANTS");
      const overview = await request(app).get(`/api/v1/courses/${fx.course.slug}/overview`).set(learner());
      expect(overview.body.data.track).toBeNull();
    } finally {
      await prisma.course.update({ where: { id: fx.course.id }, data: { familySlug: "multi-vendor-marketplace" } });
    }
  });

  it("opens the specialisation only once the course is complete, then locks the variant", async () => {
    const early = await chooseSpecialisation("catalogue-identity");
    expect(early.status).toBe(409);
    expect(early.body.code).toBe("SPECIALISATION_NOT_OPEN");

    await setProgress(100, "COMPLETED");
    try {
      expect((await chooseSpecialisation("nope")).status).toBe(400);
      const res = await chooseSpecialisation("catalogue-identity");
      expect(res.status).toBe(200);
      expect(res.body.data.track).toMatchObject({ specialisationSlug: "catalogue-identity", specialisationOpen: true });

      const locked = await chooseVariant("services");
      expect(locked.status).toBe(409);
      expect(locked.body.code).toBe("VARIANT_LOCKED_AFTER_COMPLETION");
    } finally {
      await setProgress(0, "IN_PROGRESS");
    }
  });

  it("shows the learner's choices to their mentor", async () => {
    const roster = await request(app).get(`/api/v1/teach/courses/${fx.course.slug}/mentees`).set(mentor());
    expect(roster.status).toBe(200);
    expect(roster.body.data.mentees[0].track).toEqual({
      variant: { slug: "books", label: "Books", productName: "Hamesh" },
      specialisation: { slug: "catalogue-identity", label: "Catalogue identity and matching" },
    });

    const evaluation = await request(app).get(`/api/v1/teach/courses/${fx.course.slug}/mentees/${fx.enrollment.id}`).set(mentor());
    expect(evaluation.status).toBe(200);
    expect(evaluation.body.data.track).toMatchObject({ variant: { slug: "books" }, specialisation: { slug: "catalogue-identity" } });
  });
});
