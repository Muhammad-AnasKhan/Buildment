import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../../db/prisma.js";
import { NotFoundError, UnprocessableError } from "../../utils/errors.js";

export type CreateCouponPoolInput = {
  organizationId: string;
  /** Null/undefined = general pool for any allocated course. */
  courseId?: string | null;
  label: string;
  code?: string | null;
  percentOff?: number;
  maxRedemptions: number;
  expiresAt?: Date | null;
};

function normalizeCode(code: string | null | undefined) {
  const trimmed = code?.trim();
  return trimmed ? trimmed.toUpperCase() : null;
}

export function displayLabelForPool(label: string, percentOff: number) {
  if (percentOff >= 100) return `100% free · ${label}`;
  return `${percentOff}% off · ${label}`;
}

export async function createCouponPool(input: CreateCouponPoolInput) {
  const organization = await prisma.organization.findUnique({
    where: { id: input.organizationId },
    select: { id: true },
  });
  if (!organization) throw new NotFoundError("Organization not found");

  const courseId = input.courseId?.trim() || null;
  if (courseId) {
    const allocation = await prisma.organizationCourse.findUnique({
      where: {
        organizationId_courseId: { organizationId: input.organizationId, courseId },
      },
      select: { id: true },
    });
    if (!allocation) {
      throw new UnprocessableError(
        "Allocate the course to this organization before creating a course coupon pool.",
        "COURSE_NOT_ALLOCATED"
      );
    }
  }

  const percentOff = input.percentOff ?? 100;
  if (percentOff < 1 || percentOff > 100) {
    throw new UnprocessableError("percentOff must be between 1 and 100.", "VALIDATION_ERROR");
  }
  if (input.maxRedemptions < 1) {
    throw new UnprocessableError("maxRedemptions must be at least 1.", "VALIDATION_ERROR");
  }

  return prisma.organizationCouponPool.create({
    data: {
      organizationId: input.organizationId,
      courseId,
      label: input.label.trim(),
      code: normalizeCode(input.code),
      percentOff,
      maxRedemptions: input.maxRedemptions,
      expiresAt: input.expiresAt ?? null,
    },
  });
}

export async function listCouponPools(organizationId: string) {
  const pools = await prisma.organizationCouponPool.findMany({
    where: { organizationId },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    include: {
      course: { select: { id: true, slug: true, title: true } },
    },
  });
  return pools.map((pool) => ({
    id: pool.id,
    label: pool.label,
    code: pool.code,
    percentOff: pool.percentOff,
    maxRedemptions: pool.maxRedemptions,
    redemptionCount: pool.redemptionCount,
    remaining: Math.max(0, pool.maxRedemptions - pool.redemptionCount),
    active: pool.active,
    expiresAt: pool.expiresAt?.toISOString() ?? null,
    course: pool.course,
    scope: pool.courseId ? ("course" as const) : ("general" as const),
    displayLabel: displayLabelForPool(pool.label, pool.percentOff),
  }));
}

export async function setCouponPoolActive(organizationId: string, poolId: string, active: boolean) {
  const updated = await prisma.organizationCouponPool.updateMany({
    where: { id: poolId, organizationId },
    data: { active },
  });
  if (updated.count === 0) throw new NotFoundError("Coupon pool not found");
}

/** Course-specific pool first, then a general (courseId null) pool with remaining seats. */
export async function findAvailableCouponPool(
  tx: Prisma.TransactionClient,
  organizationId: string,
  courseId: string,
  now = new Date()
) {
  const pools = await tx.organizationCouponPool.findMany({
    where: {
      organizationId,
      active: true,
      OR: [{ courseId }, { courseId: null }],
      AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
    },
    orderBy: [{ courseId: "desc" }, { createdAt: "asc" }],
  });

  return pools.find((pool) => pool.redemptionCount < pool.maxRedemptions) ?? null;
}
