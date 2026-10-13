import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { createCourseFixture, createOrganizationFixture } from "../helpers/fixtures.js";

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;
let org: Awaited<ReturnType<typeof createOrganizationFixture>>;

beforeAll(async () => {
  fx = await createCourseFixture();
  org = await createOrganizationFixture(fx.course.id, { maxEnrollments: 1 });
});
afterAll(async () => {
  await org.cleanup();
  await fx.cleanup();
});

describe("/integrations/v1 (public organisation API)", () => {
  it("describes itself without credentials", async () => {
    const res = await request(app).get("/integrations/v1");
    expect(res.body.name).toBe("Buildment Organization API");
    expect(res.body.endpoints).toHaveLength(9);
  });

  it("keeps the { error } shape for authentication failures", async () => {
    const missing = await request(app).get("/integrations/v1/connection");
    expect(missing.status).toBe(401);
    expect(missing.body.error).toBe("Missing integration credentials");

    const wrong = await request(app).get("/integrations/v1/connection").set({ ...org.headers, "x-buildment-secret-key": "bad" });
    expect(wrong.status).toBe(401);
    expect(wrong.body.error).toBe("Invalid integration credentials");
  });

  it("verifies the connection and lists allocated courses", async () => {
    const connection = await request(app).get("/integrations/v1/connection").set(org.headers);
    expect(connection.body).toEqual({ connected: true, organization_slug: org.organization.slug, organization_name: org.organization.name });

    const courses = await request(app).get("/integrations/v1/courses").set(org.headers);
    expect(courses.body.courses).toEqual([
      expect.objectContaining({ course_id: fx.course.id, course_slug: fx.course.slug, available_enrollment_count: 1 }),
    ]);

    const allocations = await request(app).get("/integrations/v1/allocations").set(org.headers);
    expect(allocations.body.allocations[0]).toMatchObject({ course_id: fx.course.id, max_enrollments: 1, current_enrollments: 0 });
  });

  it("creates an enrollment once, consumes the slot, then reports it", async () => {
    const payload = { student_email: `new-${fx.tag}@test.local`, course_id: fx.course.id, external_assignment_id: `assign-${fx.tag}` };

    const created = await request(app).post("/integrations/v1/enrollments").set(org.headers).send(payload);
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ created: true, lifecycle: "PENDING_ACCOUNT", external_assignment_id: payload.external_assignment_id });

    const again = await request(app).post("/integrations/v1/enrollments").set(org.headers).send(payload);
    expect(again.status).toBe(200);
    expect(again.body.created).toBe(false);

    const full = await request(app).post("/integrations/v1/enrollments").set(org.headers).send({ ...payload, student_email: `other-${fx.tag}@test.local`, external_assignment_id: `assign2-${fx.tag}` });
    expect(full.status).toBe(403);
    expect(full.body).toEqual({ error: "Organization enrollment limit reached", code: "CAPACITY" });

    const lookup = await request(app).get("/integrations/v1/enrollments").set(org.headers).query({ external_assignment_id: payload.external_assignment_id });
    expect(lookup.body.enrollment).toMatchObject({ enrollment_id: created.body.enrollment_id, learner_email: payload.student_email });

    const progress = await request(app).get("/integrations/v1/progress").set(org.headers).query({ course_id: fx.course.id, learner_email: payload.student_email });
    expect(progress.body).toMatchObject({ status: "NOT_STARTED", total_lessons: 2, completed_lessons: 0 });

    const cancelled = await request(app)
      .post("/integrations/v1/enrollments/cancel")
      .set(org.headers)
      .send({ org_slug: org.organization.slug, email: payload.student_email, course_id: fx.course.id });
    expect(cancelled.body).toMatchObject({ cancelled: true, already_cancelled: false });
    expect(cancelled.body.enrollment.lifecycle).toBe("CANCELLED");

    const allocations = await request(app).get("/integrations/v1/allocations").set(org.headers);
    expect(allocations.body.allocations[0].current_enrollments).toBe(0);
  });

  it("validates lookup parameters and bodies with the legacy messages", async () => {
    const lookup = await request(app).get("/integrations/v1/enrollments").set(org.headers).query({ course_id: fx.course.id });
    expect(lookup.status).toBe(400);
    expect(lookup.body.error).toMatch(/external_assignment_id or both course_id and learner_email/);

    const body = await request(app).post("/integrations/v1/enrollments").set(org.headers).send({ course_id: fx.course.id });
    expect(body.status).toBe(400);
  });

  it("records course requests and reports an existing allocation as a conflict", async () => {
    const conflict = await request(app).post("/integrations/v1/course-requests").set(org.headers).send({ course_id: fx.course.id });
    expect(conflict.status).toBe(409);
    expect(conflict.body.code).toBe("ALREADY_ALLOCATED");

    const list = await request(app).get("/integrations/v1/course-requests").set(org.headers).query({ status: "PENDING" });
    expect(list.body.requests).toEqual([]);
  });
});
