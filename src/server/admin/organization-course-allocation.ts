import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db";

export type OrganizationAllocationInput = {
  organizationId: string;
  courseId: string;
  maxEnrollments: number;
  isAllowed: boolean;
  expiresAt: Date | null;
};

export function parseAllocationExpiresAt(raw: string | undefined): Date | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  const expiresAt = new Date(trimmed);
  if (Number.isNaN(expiresAt.getTime())) {
    throw new Error("Invalid expiry date.");
  }
  return expiresAt;
}

export async function upsertOrganizationCourseAllocation(
  input: OrganizationAllocationInput,
  db: Prisma.TransactionClient | typeof prisma = prisma
) {
  return db.organizationCourse.upsert({
    where: {
      organizationId_courseId: {
        organizationId: input.organizationId,
        courseId: input.courseId,
      },
    },
    create: {
      organizationId: input.organizationId,
      courseId: input.courseId,
      maxEnrollments: input.maxEnrollments,
      isAllowed: input.isAllowed,
      expiresAt: input.expiresAt,
    },
    update: {
      maxEnrollments: input.maxEnrollments,
      isAllowed: input.isAllowed,
      expiresAt: input.expiresAt,
    },
  });
}

export async function approvePendingCourseRequestsForAllocation(
  organizationId: string,
  courseId: string,
  reviewedById: string,
  db: Prisma.TransactionClient | typeof prisma = prisma
) {
  await db.organizationCourseRequest.updateMany({
    where: { organizationId, courseId, status: "PENDING" },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewedById,
    },
  });
}
