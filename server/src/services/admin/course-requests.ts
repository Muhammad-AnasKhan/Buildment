import type { AdminCourseRequestsView } from "@buildment/shared/api/admin";
import { ADMIN_ERROR_CODES } from "@buildment/shared/api/admin";
import { prisma } from "../../db/prisma.js";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import type { ApproveCourseRequestBody } from "../../validations/admin.js";
import { notifyMentorOrganizationCourseApproved } from "../email/admin-notifications.js";
import { queueEmail } from "../email/queue.js";
import { parseExpiresAt, upsertAllocation } from "./organizations.js";

// Organisations ask for a course through POST /integrations/v1/course-requests;
// an admin approves (which creates or updates the allocation) or rejects here.

export async function listCourseRequests(): Promise<AdminCourseRequestsView> {
  const [pending, recent] = await Promise.all([
    prisma.organizationCourseRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { requestedAt: "asc" },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        course: { select: { title: true, slug: true, status: true } },
      },
    }),
    prisma.organizationCourseRequest.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { reviewedAt: "desc" },
      take: 20,
      include: {
        organization: { select: { name: true } },
        course: { select: { title: true } },
        reviewedBy: { select: { email: true } },
      },
    }),
  ]);

  return {
    pending: pending.map((req) => ({
      id: req.id,
      requestedAt: req.requestedAt.toISOString(),
      organization: req.organization,
      course: req.course,
    })),
    recent: recent.map((row) => ({
      id: row.id,
      status: row.status,
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
      reviewerEmail: row.reviewedBy?.email ?? null,
      organizationName: row.organization.name,
      courseTitle: row.course.title,
    })),
  };
}

async function requirePendingRequest(requestId: string) {
  const request = await prisma.organizationCourseRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new NotFoundError("Request not found");
  if (request.status !== "PENDING") throw new ConflictError("This request has already been reviewed.", ADMIN_ERROR_CODES.REQUEST_ALREADY_REVIEWED);
  return request;
}

export async function approveCourseRequest(admin: { id: string }, requestId: string, input: ApproveCourseRequestBody): Promise<void> {
  const request = await requirePendingRequest(requestId);
  const expiresAt = parseExpiresAt(input.expiresAt);

  await prisma.$transaction(async (tx) => {
    await tx.organizationCourseRequest.update({
      where: { id: request.id },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewedById: admin.id },
    });
    await upsertAllocation(tx, {
      organizationId: request.organizationId,
      courseId: request.courseId,
      maxEnrollments: input.maxEnrollments,
      isAllowed: true,
      expiresAt,
    });
  });

  queueEmail(() => notifyMentorOrganizationCourseApproved(request.id));
}

export async function rejectCourseRequest(admin: { id: string }, requestId: string): Promise<void> {
  const request = await requirePendingRequest(requestId);
  await prisma.organizationCourseRequest.update({
    where: { id: request.id },
    data: { status: "REJECTED", reviewedAt: new Date(), reviewedById: admin.id },
  });
}
