import { randomBytes } from "node:crypto";
import type {
  AdminOrganizationDetail,
  AdminOrganizationRow,
  CreatedOrganization,
  IssuedCredential,
} from "@buildment/shared/api/admin";
import { ADMIN_ERROR_CODES } from "@buildment/shared/api/admin";
import { slugify } from "@buildment/shared/lib/mdx-headings";
import { prisma } from "../../db/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";
import { NotFoundError, UnprocessableError } from "../../utils/errors.js";
import type { AllocationsBody, CreateOrganizationBody } from "../../validations/admin.js";
import { hashIntegrationSecret } from "../integrations/credential-hash.js";

// Tenants that call /integrations/v1: their API credentials and which published
// courses they may enrol learners into (caps and expiry are enforced there).

export async function listOrganizations(): Promise<AdminOrganizationRow[]> {
  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { courseAllocations: true, enrollments: true } },
      apiCredentials: { where: { active: true }, take: 1, select: { accessKey: true } },
    },
  });
  return organizations.map((org) => ({
    id: org.id,
    slug: org.slug,
    name: org.name,
    accessKey: org.apiCredentials[0]?.accessKey ?? null,
    allocationCount: org._count.courseAllocations,
    enrollmentCount: org._count.enrollments,
  }));
}

/** Creates the tenant with its first credential pair. The secret is returned once and never stored. */
export async function createOrganization(input: CreateOrganizationBody): Promise<CreatedOrganization> {
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
  return { organization, credential };
}

async function requireOrganization(orgId: string) {
  const organization = await prisma.organization.findUnique({ where: { id: orgId }, select: { id: true } });
  if (!organization) throw new NotFoundError("Organization not found");
  return organization;
}

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
    prisma.course.findMany({ where: { status: "PUBLISHED" }, orderBy: { title: "asc" }, select: { id: true, title: true, slug: true } }),
  ]);
  if (!org) throw new NotFoundError("Organization not found");

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
      expiresAt: row.expiresAt?.toISOString() ?? null,
    })),
    pendingRequests: org.courseRequests.map((r) => ({ id: r.id, courseId: r.courseId, courseTitle: r.course.title, courseSlug: r.course.slug })),
    publishedCourses,
  };
}

/** Deactivates every live credential and issues a fresh pair. */
export async function rotateCredential(orgId: string): Promise<IssuedCredential> {
  await requireOrganization(orgId);
  await prisma.organizationApiCredential.updateMany({ where: { organizationId: orgId, active: true }, data: { active: false } });
  return issueCredential(orgId);
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
export async function upsertAllocations(admin: { id: string }, orgId: string, input: AllocationsBody): Promise<void> {
  await requireOrganization(orgId);
  const courseIds = [...new Set(input.courses.map((row) => row.courseId))];
  const published = await prisma.course.count({ where: { id: { in: courseIds }, status: "PUBLISHED" } });
  if (published !== courseIds.length) {
    throw new UnprocessableError("One or more selected courses are missing or not published.", ADMIN_ERROR_CODES.COURSE_NOT_PUBLISHED);
  }
  const rows = input.courses.map((row) => ({ ...row, expiresAt: parseExpiresAt(row.expiresAt) }));

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      await upsertAllocation(tx, { organizationId: orgId, courseId: row.courseId, maxEnrollments: row.maxEnrollments, isAllowed: input.isAllowed, expiresAt: row.expiresAt });
      await approvePendingRequestsFor(tx, orgId, row.courseId, admin.id);
    }
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
