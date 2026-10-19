import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { createSession } from "../../src/services/auth/session.js";
import { createCourseFixture, createOrganizationFixture } from "../helpers/fixtures.js";

// Platform administration: tenants and credentials, allocations, course
// requests, accounts and instructor access.

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;
let org: Awaited<ReturnType<typeof createOrganizationFixture>>;
let adminToken = "";
let adminId = "";
let createdOrgId = "";
let duplicateOrgId = "";
const createdUserIds: string[] = [];

beforeAll(async () => {
  fx = await createCourseFixture();
  org = await createOrganizationFixture(fx.course.id);
  const admin = await prisma.user.create({
    data: { email: `admin-${fx.tag}@test.local`, name: "Test Admin", role: "ADMIN", emailVerified: new Date() },
  });
  adminId = admin.id;
  adminToken = (await createSession(admin.id)).sessionToken;
});

afterAll(async () => {
  for (const id of [createdOrgId, duplicateOrgId]) {
    if (id) await prisma.organization.delete({ where: { id } }).catch(() => undefined);
  }
  await prisma.instructorAccessRequest.deleteMany({ where: { userId: { in: [...createdUserIds, fx.learner.id] } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  await org.cleanup();
  await prisma.session.deleteMany({ where: { userId: adminId } });
  await prisma.user.delete({ where: { id: adminId } });
  await fx.cleanup();
});

const admin = () => ({ Authorization: `Bearer ${adminToken}` });
const mentor = async () => ({ Authorization: `Bearer ${(await createSession(fx.mentor.id)).sessionToken}` });

describe("/api/v1/admin access", () => {
  it("is limited to administrators", async () => {
    expect((await request(app).get("/api/v1/admin/overview")).status).toBe(401);
    const res = await request(app).get("/api/v1/admin/overview").set(await mentor());
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ADMIN_REQUIRED");
  });

  it("serves the overview counts and the course catalog", async () => {
    const overview = await request(app).get("/api/v1/admin/overview").set(admin());
    expect(overview.status).toBe(200);
    expect(overview.body.data.organizations).toBeGreaterThanOrEqual(1);
    expect(overview.body.data.publishedCourses).toBeGreaterThanOrEqual(1);

    const courses = await request(app).get("/api/v1/admin/courses").set(admin());
    const row = courses.body.data.courses.find((c: { id: string }) => c.id === fx.course.id);
    expect(row).toMatchObject({ slug: fx.course.slug, status: "PUBLISHED", instructorLabel: "Test Mentor", enrollmentCount: 1, allocationCount: 1 });
  });
});

describe("organizations", () => {
  it("creates a tenant with a one-time credential and a unique slug", async () => {
    const res = await request(app).post("/api/v1/admin/organizations").set(admin()).send({ name: `Org ${fx.tag}` });
    expect(res.status).toBe(201);
    createdOrgId = res.body.data.organization.id;
    expect(res.body.data.organization.slug).toBe(`org-${fx.tag}`);
    expect(res.body.data.credential.accessKey).toMatch(/^org_live_/);
    expect(res.body.data.credential.secret.length).toBeGreaterThan(20);

    // A requested slug that is already taken gets a numeric suffix.
    const duplicate = await request(app).post("/api/v1/admin/organizations").set(admin()).send({ name: "Duplicate", slug: org.organization.slug });
    expect(duplicate.status).toBe(201);
    duplicateOrgId = duplicate.body.data.organization.id;
    expect(duplicate.body.data.organization.slug).toBe(`${org.organization.slug}-2`);

    const list = await request(app).get("/api/v1/admin/organizations").set(admin());
    const row = list.body.data.organizations.find((o: { id: string }) => o.id === createdOrgId);
    expect(row).toMatchObject({ accessKey: res.body.data.credential.accessKey, allocationCount: 0, enrollmentCount: 0 });

    expect((await request(app).post("/api/v1/admin/organizations").set(admin()).send({ name: "x" })).status).toBe(400);
  });

  it("rotates credentials, deactivating the previous pair", async () => {
    const res = await request(app).post(`/api/v1/admin/organizations/${createdOrgId}/credentials/rotate`).set(admin());
    expect(res.status).toBe(201);
    const detail = await request(app).get(`/api/v1/admin/organizations/${createdOrgId}`).set(admin());
    expect(detail.status).toBe(200);
    expect(detail.body.data.credentials).toHaveLength(2);
    expect(detail.body.data.credentials.map((c: { active: boolean }) => c.active)).toEqual([true, false]);
    expect(detail.body.data.credentials[0].accessKey).toBe(res.body.data.accessKey);
    expect((await request(app).get("/api/v1/admin/organizations/nope").set(admin())).status).toBe(404);
  });

  it("allocates published courses and refuses unpublished ones", async () => {
    const ok = await request(app)
      .put(`/api/v1/admin/organizations/${createdOrgId}/allocations`)
      .set(admin())
      .send({ isAllowed: true, courses: [{ courseId: fx.course.id, maxEnrollments: 25, expiresAt: "2030-01-31" }] });
    expect(ok.status).toBe(204);

    const detail = await request(app).get(`/api/v1/admin/organizations/${createdOrgId}`).set(admin());
    expect(detail.body.data.allocations).toHaveLength(1);
    expect(detail.body.data.allocations[0]).toMatchObject({ course: { id: fx.course.id }, maxEnrollments: 25, isAllowed: true, currentEnrollments: 0 });
    expect(detail.body.data.allocations[0].expiresAt).toMatch(/^2030-01-31/);
    expect(detail.body.data.publishedCourses.map((c: { id: string }) => c.id)).toContain(fx.course.id);

    const bad = await request(app)
      .put(`/api/v1/admin/organizations/${createdOrgId}/allocations`)
      .set(admin())
      .send({ isAllowed: true, courses: [{ courseId: "nope", maxEnrollments: 1 }] });
    expect(bad.status).toBe(422);
    expect(bad.body.code).toBe("COURSE_NOT_PUBLISHED");
  });
});

describe("course requests", () => {
  let requestId = "";

  it("approves a pending request and creates the allocation", async () => {
    const second = await prisma.course.create({
      data: { slug: `second-${fx.tag}`, title: "Second course", status: "PUBLISHED", mentorId: fx.mentor.id, publishedAt: new Date() },
    });
    try {
      const created = await prisma.organizationCourseRequest.create({ data: { organizationId: org.organization.id, courseId: second.id } });
      requestId = created.id;

      const list = await request(app).get("/api/v1/admin/course-requests").set(admin());
      expect(list.body.data.pending.find((r: { id: string }) => r.id === requestId)).toMatchObject({
        organization: { id: org.organization.id },
        course: { title: "Second course", status: "PUBLISHED" },
      });

      const approve = await request(app).post(`/api/v1/admin/course-requests/${requestId}/approve`).set(admin()).send({ maxEnrollments: 10, expiresAt: "" });
      expect(approve.status).toBe(204);
      const allocation = await prisma.organizationCourse.findUnique({ where: { organizationId_courseId: { organizationId: org.organization.id, courseId: second.id } } });
      expect(allocation).toMatchObject({ maxEnrollments: 10, isAllowed: true, expiresAt: null });

      const again = await request(app).post(`/api/v1/admin/course-requests/${requestId}/reject`).set(admin());
      expect(again.status).toBe(409);
      expect(again.body.code).toBe("REQUEST_ALREADY_REVIEWED");

      const after = await request(app).get("/api/v1/admin/course-requests").set(admin());
      expect(after.body.data.recent.find((r: { id: string }) => r.id === requestId)).toMatchObject({ status: "APPROVED", reviewerEmail: `admin-${fx.tag}@test.local` });
    } finally {
      await prisma.organizationCourseRequest.deleteMany({ where: { courseId: second.id } });
      await prisma.organizationCourse.deleteMany({ where: { courseId: second.id } });
      await prisma.course.delete({ where: { id: second.id } });
    }
  });
});

describe("users and instructor access", () => {
  it("lists accounts and toggles instructor capability", async () => {
    const list = await request(app).get("/api/v1/admin/users").set(admin());
    expect(list.status).toBe(200);
    const learner = list.body.data.users.find((u: { id: string }) => u.id === fx.learner.id);
    expect(learner).toMatchObject({ role: "MENTEE", emailVerified: true, enrollmentCount: 1 });

    const grant = await request(app).patch(`/api/v1/admin/users/${fx.learner.id}/instructor-access`).set(admin()).send({ enabled: true });
    expect(grant.status).toBe(204);
    expect(await prisma.user.findUniqueOrThrow({ where: { id: fx.learner.id } })).toMatchObject({ role: "MENTOR" });

    const revoke = await request(app).patch(`/api/v1/admin/users/${fx.learner.id}/instructor-access`).set(admin()).send({ enabled: false });
    expect(revoke.status).toBe(204);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: fx.learner.id } })).role).toBe("MENTEE");
    expect((await request(app).patch("/api/v1/admin/users/nope/instructor-access").set(admin()).send({ enabled: true })).status).toBe(404);
  });

  it("grants instructor access by email, creating the account when needed", async () => {
    const email = `new-instructor-${fx.tag}@test.local`;
    const res = await request(app).post("/api/v1/admin/instructors").set(admin()).send({ email: email.toUpperCase(), name: "New Instructor" });
    expect(res.status).toBe(204);
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    createdUserIds.push(user.id);
    expect(user).toMatchObject({ role: "MENTOR", name: "New Instructor" });
    expect(user.emailVerified).not.toBeNull();
  });

  it("approves and rejects instructor access requests once", async () => {
    // The toggle test left an approved request behind; start from a clean learner.
    await prisma.instructorAccessRequest.deleteMany({ where: { userId: fx.learner.id } });
    await prisma.user.update({ where: { id: fx.learner.id }, data: { role: "MENTEE" } });
    const asked = await request(app).post("/api/v1/learner/instructor-access-requests").set("Authorization", `Bearer ${fx.learnerToken}`).send({ message: "I teach Go." });
    expect([200, 201]).toContain(asked.status);
    const pending = await prisma.instructorAccessRequest.findUniqueOrThrow({ where: { userId: fx.learner.id } });

    const list = await request(app).get("/api/v1/admin/users").set(admin());
    expect(list.body.data.pendingInstructorRequests.find((r: { id: string }) => r.id === pending.id)).toMatchObject({ message: "I teach Go.", user: { id: fx.learner.id } });

    const approve = await request(app).post(`/api/v1/admin/instructor-access-requests/${pending.id}/approve`).set(admin());
    expect(approve.status).toBe(204);
    expect(await prisma.instructorAccessRequest.findUniqueOrThrow({ where: { id: pending.id } })).toMatchObject({ status: "APPROVED", reviewedById: adminId });
    expect((await prisma.user.findUniqueOrThrow({ where: { id: fx.learner.id } })).role).toBe("MENTOR");

    const reject = await request(app).post(`/api/v1/admin/instructor-access-requests/${pending.id}/reject`).set(admin());
    expect(reject.status).toBe(409);
  });
});
