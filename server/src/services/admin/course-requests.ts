import type { AdminBulkResult, AdminCourseRequestsView } from "../../shared/api/admin.js";
import { ADMIN_ERROR_CODES } from "../../shared/api/admin.js";
import { prisma } from "../../db/prisma.js";
import { ConflictError, NotFoundError, isAppError } from "../../utils/errors.js";
import type { ApproveCourseRequestBody, ListRequestsQuery } from "../../validations/admin.js";
import { notifyMentorOrganizationCourseApproved } from "../email/admin-notifications.js";
import { queueEmail } from "../email/queue.js";
import { parseExpiresAt, upsertAllocation } from "./organizations.js";
import { ADMIN_AUDIT_ACTIONS, recordAdminAction, type AdminActor } from "./audit.js";
import { pageInfo, resolvePaging } from "./paging.js";

// Organisations ask for a course through POST /integrations/v1/course-requests;
// an admin approves (which creates or updates the allocation) or rejects here.

export async function listCourseRequests(filters: ListRequestsQuery = {}): Promise<AdminCourseRequestsView> {
  const [pendingTotal, recentTotal] = await Promise.all([
    prisma.organizationCourseRequest.count({ where: { status: "PENDING" } }),
    prisma.organizationCourseRequest.count({ where: { status: { in: ["APPROVED", "REJECTED"] } } }),
  ]);
  const pendingPaging = resolvePaging(filters, pendingTotal);
  const recentPaging = resolvePaging({ page: filters.recentPage, pageSize: filters.pageSize }, recentTotal);

  const [pending, recent] = await Promise.all([
    prisma.organizationCourseRequest.findMany({
      where: { status: "PENDING" },
      orderBy: [{ requestedAt: "asc" }, { id: "asc" }],
      skip: pendingPaging.skip,
      take: pendingPaging.take,
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        course: { select: { title: true, slug: true, status: true } },
      },
    }),
    prisma.organizationCourseRequest.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: [{ reviewedAt: "desc" }, { id: "desc" }],
      skip: recentPaging.skip,
      take: recentPaging.take,
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
    pendingPage: pageInfo(pendingPaging),
    recent: recent.map((row) => ({
      id: row.id,
      status: row.status,
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
      reviewerEmail: row.reviewedBy?.email ?? null,
      organizationName: row.organization.name,
      courseTitle: row.course.title,
    })),
    recentPage: pageInfo(recentPaging),
  };
}

async function requirePendingRequest(requestId: string) {
  const request = await prisma.organizationCourseRequest.findUnique({
    where: { id: requestId },
    include: {
      organization: { select: { name: true } },
      course: { select: { title: true } },
    },
  });
  if (!request) throw new NotFoundError("Request not found");
  if (request.status !== "PENDING") throw new ConflictError("This request has already been reviewed.", ADMIN_ERROR_CODES.REQUEST_ALREADY_REVIEWED);
  return request;
}

export async function approveCourseRequest(actor: AdminActor, requestId: string, input: ApproveCourseRequestBody): Promise<void> {
  const request = await requirePendingRequest(requestId);
  const expiresAt = parseExpiresAt(input.expiresAt);

  await prisma.$transaction(async (tx) => {
    await tx.organizationCourseRequest.update({
      where: { id: request.id },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewedById: actor.id },
    });
    await upsertAllocation(tx, {
      organizationId: request.organizationId,
      courseId: request.courseId,
      maxEnrollments: input.maxEnrollments,
      isAllowed: true,
      expiresAt,
    });
    await recordAdminAction(tx, {
      actor,
      action: ADMIN_AUDIT_ACTIONS.COURSE_REQUEST_APPROVE,
      targetType: "CourseRequest",
      targetId: request.id,
      summary: `Approved ${request.course.title} for ${request.organization.name}`,
      metadata: { organizationId: request.organizationId, courseId: request.courseId, maxEnrollments: input.maxEnrollments },
    });
  });

  queueEmail(() => notifyMentorOrganizationCourseApproved(request.id));
}

export async function rejectCourseRequest(actor: AdminActor, requestId: string): Promise<void> {
  const request = await requirePendingRequest(requestId);
  await prisma.$transaction(async (tx) => {
    await tx.organizationCourseRequest.update({
      where: { id: request.id },
      data: { status: "REJECTED", reviewedAt: new Date(), reviewedById: actor.id },
    });
    await recordAdminAction(tx, {
      actor,
      action: ADMIN_AUDIT_ACTIONS.COURSE_REQUEST_REJECT,
      targetType: "CourseRequest",
      targetId: request.id,
      summary: `Rejected ${request.course.title} for ${request.organization.name}`,
      metadata: { organizationId: request.organizationId, courseId: request.courseId },
    });
  });
}

/** Bulk review: each request goes through the single-item path, and outcomes are reported per request. */
async function runEach(idList: string[], work: (id: string) => Promise<void>): Promise<AdminBulkResult> {
  const result: AdminBulkResult = { updated: 0, skipped: [] };
  for (const id of idList) {
    try {
      await work(id);
      result.updated += 1;
    } catch (error) {
      result.skipped.push({ id, reason: isAppError(error) ? error.message : "Could not be updated." });
    }
  }
  return result;
}

export function bulkApproveCourseRequests(
  actor: AdminActor,
  ids: string[],
  input: ApproveCourseRequestBody
): Promise<AdminBulkResult> {
  return runEach(ids, (id) => approveCourseRequest(actor, id, input));
}

export function bulkRejectCourseRequests(actor: AdminActor, ids: string[]): Promise<AdminBulkResult> {
  return runEach(ids, (id) => rejectCourseRequest(actor, id));
}
