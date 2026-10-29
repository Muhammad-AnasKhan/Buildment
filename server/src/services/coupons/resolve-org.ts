import { prisma } from "../../db/prisma.js";
import { findAvailableCouponPool } from "./pools.js";

/**
 * When a mentor assigns without an explicit org, pick the single allocated org
 * that still has coupon seats for this course. Ambiguous or empty → null.
 */
export async function resolveCouponOrganizationForCourse(courseId: string) {
  const allocations = await prisma.organizationCourse.findMany({
    where: { courseId, isAllowed: true },
    select: { organizationId: true, organization: { select: { id: true, name: true, slug: true } } },
  });
  if (allocations.length === 0) return null;

  const matching: Array<{ organizationId: string; name: string; slug: string }> = [];
  for (const row of allocations) {
    const pool = await prisma.$transaction((tx) =>
      findAvailableCouponPool(tx, row.organizationId, courseId)
    );
    if (pool) {
      matching.push({
        organizationId: row.organizationId,
        name: row.organization.name,
        slug: row.organization.slug,
      });
    }
  }

  if (matching.length !== 1) return null;
  return matching[0]!;
}
