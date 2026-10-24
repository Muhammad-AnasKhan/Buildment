import type { Prisma } from "../../generated/prisma/index.js";
import { resolveCourseFamily } from "../../shared/lib/course-tracks.js";

/** Called inside the transaction that creates a new enrollment. Existing rows are never reassigned. */
export async function assignmentForNewEnrollment(tx: Prisma.TransactionClient, courseId: string) {
  // Serialize assignment per course so simultaneous enrollments see each other's picks.
  // The same row guards changes to the mode and published release.
  await tx.$queryRaw`SELECT "id" FROM "Course" WHERE "id" = ${courseId} FOR UPDATE`;
  const course = await tx.course.findUniqueOrThrow({ where: { id: courseId }, select: {
    familySlug: true, variantFamily: true, variantAssignment: true, availableVariantSlugs: true,
  } });
  const family = resolveCourseFamily(course.familySlug, course.variantFamily);
  if (course.variantAssignment !== "RANDOM" || !family?.variants.length) return {};
  const available = course.availableVariantSlugs.length
    ? family.variants.filter(variant => course.availableVariantSlugs.includes(variant.slug))
    : family.variants;
  if (!available.length) return {};

  const groups = await tx.enrollment.groupBy({
    by: ["variantSlug"],
    where: { courseId, variantSlug: { in: available.map(variant => variant.slug) },
      lifecycle: { notIn: ["CANCELLED", "EXPIRED"] } },
    _count: { _all: true },
  });
  const counts = new Map(groups.map(group => [group.variantSlug, group._count._all]));
  const fewest = Math.min(...available.map(variant => counts.get(variant.slug) ?? 0));
  const candidates = available.filter(variant => (counts.get(variant.slug) ?? 0) === fewest);
  const chosen = candidates[Math.floor(Math.random() * candidates.length)]!;
  const now = new Date();
  return { variantSlug: chosen.slug, variantChosenAt: now, variantLockedAt: now, variantAssignedAt: now };
}
