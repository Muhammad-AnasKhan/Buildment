import type { OrganizationCourse, Prisma } from "@/generated/prisma/client";

export class AllocationError extends Error {
  readonly code:
    | "NOT_ALLOCATED"
    | "NOT_ALLOWED"
    | "EXPIRED"
    | "CAPACITY";

  constructor(code: AllocationError["code"], message: string) {
    super(message);
    this.name = "AllocationError";
    this.code = code;
  }
}

export function assertOrganizationCourseAllocation(
  allocation: OrganizationCourse | null,
  now = new Date()
): OrganizationCourse {
  if (!allocation) {
    throw new AllocationError("NOT_ALLOCATED", "Course is not allocated to this organization");
  }
  if (!allocation.isAllowed) {
    throw new AllocationError("NOT_ALLOWED", "Course allocation is disabled");
  }
  if (allocation.expiresAt && allocation.expiresAt <= now) {
    throw new AllocationError("EXPIRED", "Course allocation has expired");
  }
  if (allocation.currentEnrollments >= allocation.maxEnrollments) {
    throw new AllocationError("CAPACITY", "Organization enrollment limit reached");
  }
  return allocation;
}

/** Atomically consume one enrollment slot on the allocation row. */
export async function consumeEnrollmentSlot(
  tx: Prisma.TransactionClient,
  organizationCourseId: string
): Promise<void> {
  const updated = await tx.$executeRaw`
    UPDATE "OrganizationCourse"
    SET "currentEnrollments" = "currentEnrollments" + 1, "updatedAt" = NOW()
    WHERE "id" = ${organizationCourseId}
      AND "isAllowed" = true
      AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
      AND "currentEnrollments" < "maxEnrollments"
  `;
  if (updated !== 1) {
    throw new AllocationError("CAPACITY", "Organization enrollment limit reached");
  }
}

export function availableEnrollmentCount(allocation: OrganizationCourse): number {
  return Math.max(0, allocation.maxEnrollments - allocation.currentEnrollments);
}

/** Return one consumed slot when an org integration enrollment is cancelled. */
export async function releaseEnrollmentSlot(
  tx: Prisma.TransactionClient,
  organizationId: string,
  courseId: string
): Promise<void> {
  await tx.$executeRaw`
    UPDATE "OrganizationCourse"
    SET "currentEnrollments" = GREATEST("currentEnrollments" - 1, 0), "updatedAt" = NOW()
    WHERE "organizationId" = ${organizationId}
      AND "courseId" = ${courseId}
  `;
}
