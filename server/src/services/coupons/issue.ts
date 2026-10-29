import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../../db/prisma.js";
import { displayLabelForPool, findAvailableCouponPool } from "./pools.js";

export class CouponIssueError extends Error {
  readonly code: "NO_POOL" | "CAPACITY";
  constructor(code: CouponIssueError["code"], message: string) {
    super(message);
    this.name = "CouponIssueError";
    this.code = code;
  }
}

export type IssueCouponInput = {
  organizationId: string;
  courseId: string;
  enrollmentId: string;
  userId?: string | null;
  learnerEmail?: string | null;
  assignedById?: string | null;
};

async function consumePoolSeat(tx: Prisma.TransactionClient, poolId: string) {
  const updated = await tx.$executeRaw`
    UPDATE "OrganizationCouponPool"
    SET "redemptionCount" = "redemptionCount" + 1, "updatedAt" = NOW()
    WHERE "id" = ${poolId}
      AND "active" = true
      AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
      AND "redemptionCount" < "maxRedemptions"
  `;
  if (updated !== 1) {
    throw new CouponIssueError("CAPACITY", "Coupon pool has no remaining seats");
  }
}

/**
 * Reserve one coupon seat for an enrollment. Idempotent when the enrollment already has a usage.
 * Returns null when the org has no matching pool (caller keeps normal paid/free behavior).
 * Must run inside the caller's transaction.
 */
export async function issueCouponForEnrollment(tx: Prisma.TransactionClient, input: IssueCouponInput) {
  const existing = await tx.couponUsage.findUnique({
    where: { enrollmentId: input.enrollmentId },
  });
  if (existing) return existing;

  const pool = await findAvailableCouponPool(tx, input.organizationId, input.courseId);
  if (!pool) return null;

  await consumePoolSeat(tx, pool.id);

  return tx.couponUsage.create({
    data: {
      poolId: pool.id,
      organizationId: input.organizationId,
      courseId: input.courseId,
      enrollmentId: input.enrollmentId,
      userId: input.userId ?? null,
      learnerEmail: input.learnerEmail?.trim().toLowerCase() || null,
      percentOff: pool.percentOff,
      displayLabel: displayLabelForPool(pool.label, pool.percentOff),
      assignedById: input.assignedById ?? null,
      status: "ISSUED",
    },
  });
}

/** Same as issueCouponForEnrollment, for callers outside an open transaction. */
export async function issueCouponForEnrollmentStandalone(input: IssueCouponInput) {
  return prisma.$transaction((tx) => issueCouponForEnrollment(tx, input));
}

/** True when a coupon fully covers payment for a paid course. */
export function couponUnlocksContent(percentOff: number) {
  return percentOff >= 100;
}
