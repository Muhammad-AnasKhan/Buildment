import { randomBytes } from "node:crypto";
import type {
  AdminOrganizationDetail,
  AdminOrganizationsView,
  CreatedOrganization,
  IssuedCredential,
} from "../../shared/api/admin.js";
import { ADMIN_ERROR_CODES } from "../../shared/api/admin.js";
import { slugify } from "../../shared/lib/mdx-headings.js";
import { prisma } from "../../db/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";
import { NotFoundError, UnprocessableError } from "../../utils/errors.js";
import type { AllocationsBody, CreateOrganizationBody, ListOrganizationsQuery } from "../../validations/admin.js";
import { hashIntegrationSecret } from "../integrations/credential-hash.js";
import { ADMIN_AUDIT_ACTIONS, recordAdminAction, type AdminActor } from "./audit.js";
import { pageInfo, resolvePaging } from "./paging.js";

// Tenants that call /integrations/v1: their API credentials and which published
// courses they may enrol learners into (caps and expiry are enforced there).

export async function listOrganizations(filters: ListOrganizationsQuery = {}): Promise<AdminOrganizationsView> {
  const where: Prisma.OrganizationWhereInput = filters.query
    ? {
        OR: [
          { name: { contains: filters.query, mode: "insensitive" as const } },
          { slug: { contains: filters.query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const total = await prisma.organization.count({ where });
  const paging = resolvePaging(filters, total);

  const organizations = await prisma.organization.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: paging.skip,
    take: paging.take,
    include: {
      _count: { select: { courseAllocations: true, enrollments: true } },
      apiCredentials: { where: { active: true }, take: 1, select: { accessKey: true } },
    },
  });

  return {
    organizations: organizations.map((org) => ({
      id: org.id,
      slug: org.slug,
      name: org.name,
      accessKey: org.apiCredentials[0]?.accessKey ?? null,
      allocationCount: org._count.courseAllocations,
      enrollmentCount: org._count.enrollments,
    })),
    page: pageInfo(paging),
  };
}

/** Creates the tenant with its first credential pair. The secret is returned once and never stored. */
export async function createOrganization(actor: AdminActor, input: CreateOrganizationBody): Promise<CreatedOrganization> {
  const baseSlug = slugify(input.slug || input.name) || "org";
  let slug = baseSlug;
  for (let n = 2; ; n += 1) {
    const taken = await prisma.organization.findUnique({ where: { slug }, select: { id: true } });
    if (!taken) break;
    slug = `${baseSlug}-${n}`;
  }

  const organization = await prisma.organization.create({
    data: { name: input.name, slug },
    select: { id: true, slug: true, name: true },
  });
  const credential = await issueCredential(organization.id);
  await recordAdminAction(prisma, {
    actor,
    action: ADMIN_AUDIT_ACTIONS.ORGANIZATION_CREATE,
    targetType: "Organization",
    targetId: organization.id,
    summary: `Created organization ${organization.name} (${organization.slug})`,
  });
  return { organization, credential };
}

async function requireOrganization(orgId: string) {
  const organization = await prisma.organization.findUnique({ where: { id: orgId }, select: { id: true, name: true } });
  if (!organization) throw new NotFoundError("Organization not found");
  return organization;
}

/** Upper bound on the allocation picker's catalog read (see the page for why it is not paged). */
const PUBLISHED_COURSES_CAP = 500;

export async function getOrganization(orgId: string): Promise<AdminOrganizationDetail> {
  const [org, publishedCourses] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        apiCredentials: { orderBy: { createdAt: "desc" } },
        courseAllocations: {
          orderBy: { updatedAt: "desc" },
          include: { course: { select: { id: true, title: true, slug: true, status: true } } },
        },
        courseRequests: { where: { status: "PENDING" }, include: { course: { select: { title: true, slug: true } } } },
        _count: { select: { enrollments: true } },
      },
    }),
    // One extra row tells us whether the cap was hit.
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { title: "asc" },
      take: PUBLISHED_COURSES_CAP + 1,
      select: { id: true, title: true, slug: true },
    }),
  ]);
  if (!org) throw new NotFoundError("Organization not found");

  const truncated = publishedCourses.length > PUBLISHED_COURSES_CAP;

  return {
    organization: { id: org.id, slug: org.slug, name: org.name, enrollmentCount: org._count.enrollments },
    credentials: org.apiCredentials.map((cred) => ({
      id: cred.id,
      accessKey: cred.accessKey,
      label: cred.label,
      active: cred.active,
      lastUsedAt: cred.lastUsedAt?.toISOString() ?? null,
    })),
    allocations: org.courseAllocations.map((row) => ({
      id: row.id,
      course: row.course,
      isAllowed: row.isAllowed,
      maxEnrollments: row.maxEnrollments,
      currentEnrollments: row.currentEnrollments,
      leaderboardEnabled: row.leaderboardEnabled,
      expiresAt: row.expiresAt?.toISOString() ?? null,
    })),
    pendingRequests: org.courseRequests.map((r) => ({ id: r.id, courseId: r.courseId, courseTitle: r.course.title, courseSlug: r.course.slug })),
    publishedCourses: publishedCourses.slice(0, PUBLISHED_COURSES_CAP),
    publishedCoursesTruncated: truncated,
  };
}

/** Deactivates every live credential and issues a fresh pair. */
export async function rotateCredential(actor: AdminActor, orgId: string): Promise<IssuedCredential> {
  const organization = await requireOrganization(orgId);
  await prisma.organizationApiCredential.updateMany({ where: { organizationId: orgId, active: true }, data: { active: false } });
  const credential = await issueCredential(orgId);
  await recordAdminAction(prisma, {
    actor,
    action: ADMIN_AUDIT_ACTIONS.ORGANIZATION_ROTATE_CREDENTIAL,
    targetType: "Organization",
    targetId: orgId,
    summary: `Rotated API credentials for ${organization.name}`,
    metadata: { accessKey: credential.accessKey },
  });
  return credential;
}

async function issueCredential(organizationId: string): Promise<IssuedCredential> {
  const accessKey = `org_live_${randomBytes(12).toString("hex")}`;
  const secret = randomBytes(24).toString("base64url");
  await prisma.organizationApiCredential.create({
    data: { organizationId, accessKey, secretHash: hashIntegrationSecret(secret), label: "default" },
  });
  return { accessKey, secret };
}

/** `<input type="date">` value → end-of-nothing Date; rejects garbage with a stable code. */
export function parseExpiresAt(raw: string | undefined): Date | null {
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) throw new UnprocessableError("Invalid expiry date.", ADMIN_ERROR_CODES.INVALID_EXPIRY);
  return date;
}

/**
 * Adds or updates allocations for several published courses at once and
 * approves any pending request for the same (organisation, course) pair.
 */
export async function upsertAllocations(actor: AdminActor, orgId: string, input: AllocationsBody): Promise<void> {
  const organization = await requireOrganization(orgId);
  const courseIds = [...new Set(input.courses.map((row) => row.courseId))];
  const removeCourseIds = [...new Set(input.removeCourseIds)];
  const overlap = courseIds.filter((courseId) => removeCourseIds.includes(courseId));
  if (overlap.length > 0) {
    throw new UnprocessableError("A course cannot be assigned and removed in the same update.", "INVALID_ALLOCATION_UPDATE");
  }
  const published = await prisma.course.count({ where: { id: { in: courseIds }, status: "PUBLISHED" } });
  if (published !== courseIds.length) {
    throw new UnprocessableError("One or more selected courses are missing or not published.", ADMIN_ERROR_CODES.COURSE_NOT_PUBLISHED);
  }
  const rows = input.courses.map((row) => ({ ...row, expiresAt: parseExpiresAt(row.expiresAt) }));

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      await upsertAllocation(tx, { organizationId: orgId, courseId: row.courseId, maxEnrollments: row.maxEnrollments, isAllowed: input.isAllowed, expiresAt: row.expiresAt });
      await approvePendingRequestsFor(tx, orgId, row.courseId, actor.id);
    }
    if (removeCourseIds.length > 0) {
      const activeAllocations = await tx.organizationCourse.findMany({
        where: { organizationId: orgId, courseId: { in: removeCourseIds }, currentEnrollments: { gt: 0 } },
        select: { course: { select: { title: true } }, currentEnrollments: true },
      });
      if (activeAllocations.length > 0) {
        throw new UnprocessableError(
          "Courses with active enrollments cannot be removed.",
          "ACTIVE_ENROLLMENTS",
          activeAllocations.map((row) => `${row.course.title} has ${row.currentEnrollments} active enrollment${row.currentEnrollments === 1 ? "" : "s"}.`)
        );
      }
      await tx.organizationCourse.deleteMany({ where: { organizationId: orgId, courseId: { in: removeCourseIds } } });
    }
    await recordAdminAction(tx, {
      actor,
      action: ADMIN_AUDIT_ACTIONS.ORGANIZATION_ALLOCATE,
      targetType: "Organization",
      targetId: orgId,
      summary: `${input.isAllowed ? "Allocated" : "Updated"} ${rows.length} course${rows.length === 1 ? "" : "s"} for ${organization.name}`,
      metadata: { courseIds, removedCourseIds: removeCourseIds, isAllowed: input.isAllowed },
    });
  });
}

export type AllocationInput = {
  organizationId: string;
  courseId: string;
  maxEnrollments: number;
  isAllowed: boolean;
  expiresAt: Date | null;
};

export function upsertAllocation(tx: Prisma.TransactionClient, input: AllocationInput) {
  const { organizationId, courseId, ...fields } = input;
  return tx.organizationCourse.upsert({
    where: { organizationId_courseId: { organizationId, courseId } },
    create: { organizationId, courseId, ...fields },
    update: fields,
  });
}

export function approvePendingRequestsFor(tx: Prisma.TransactionClient, organizationId: string, courseId: string, reviewedById: string) {
  return tx.organizationCourseRequest.updateMany({
    where: { organizationId, courseId, status: "PENDING" },
    data: { status: "APPROVED", reviewedAt: new Date(), reviewedById },
  });
}

/** Lets (or stops) this organization's learners joining the course's weekly leaderboards. */
export async function setAllocationLeaderboard(orgId: string, courseId: string, enabled: boolean): Promise<void> {
  const { count } = await prisma.organizationCourse.updateMany({
    where: { organizationId: orgId, courseId },
    data: { leaderboardEnabled: enabled },
  });
  if (count === 0) throw new NotFoundError("Allocation not found");
}
