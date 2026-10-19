import { prisma } from "../../db/prisma.js";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import type { AuthenticatedOrganization } from "../../types/auth.js";
import { notifyAdminsOrganizationCourseRequest } from "../notifications/events.js";
import { dispatchNotification } from "../notifications/service.js";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export async function listCourseRequests(org: AuthenticatedOrganization, status?: RequestStatus) {
  const rows = await prisma.organizationCourseRequest.findMany({
    where: { organizationId: org.id, ...(status ? { status } : {}) },
    orderBy: { requestedAt: "desc" },
    include: { course: { select: { id: true, title: true, slug: true, status: true } } },
  });

  return rows.map((row) => ({
    request_id: row.id,
    course_id: row.courseId,
    course_title: row.course.title,
    course_status: row.course.status,
    status: row.status,
    requested_at: row.requestedAt.toISOString(),
    reviewed_at: row.reviewedAt?.toISOString() ?? null,
  }));
}

export type CourseRequestResult =
  | { request_id: string; course_id: string; status: "PENDING"; created: true }
  | { request_id: string; status: "PENDING"; created: false };

/** Ask platform admins to allocate a published course. Idempotent while a request is pending. */
export async function createCourseRequest(
  org: AuthenticatedOrganization,
  courseId: string
): Promise<CourseRequestResult> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, status: true },
  });
  if (!course || course.status !== "PUBLISHED") {
    throw new NotFoundError("Course not found or not published");
  }

  const allocation = await prisma.organizationCourse.findUnique({
    where: { organizationId_courseId: { organizationId: org.id, courseId: course.id } },
  });
  if (allocation?.isAllowed) {
    throw new ConflictError("Course is already allocated to this organization", "ALREADY_ALLOCATED");
  }

  const pending = await prisma.organizationCourseRequest.findFirst({
    where: { organizationId: org.id, courseId: course.id, status: "PENDING" },
  });
  if (pending) return { request_id: pending.id, status: "PENDING", created: false };

  const created = await prisma.organizationCourseRequest.create({
    data: { organizationId: org.id, courseId: course.id, status: "PENDING" },
  });
  await dispatchNotification(() => notifyAdminsOrganizationCourseRequest(created.id));

  return { request_id: created.id, course_id: course.id, status: "PENDING", created: true };
}
