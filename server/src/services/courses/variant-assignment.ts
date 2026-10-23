import type { Prisma, Role } from "../../generated/prisma/index.js";
import { findCourseFamily, pickBalancedVariant, type VariantAssignment } from "../../shared/lib/course-tracks.js";
import { prisma } from "../../db/prisma.js";
import { isMentorOfCourse } from "../auth/access-rules.js";

// Courses in a family with variantAssignment RANDOM give each enrolment a
// variant instead of letting the learner pick. The pick is balanced: the
// variant fewest enrolments have comes first. Two enrolments created at the same
// moment can land on the same variant; the next one evens it out again.

type AssigningCourse = { familySlug: string | null; variantAssignment: VariantAssignment };

/**
 * Gives a new enrolment a variant when its course assigns them. Never replaces
 * a variant the enrolment already has. Returns the variant the enrolment now
 * has, or null when the course does not assign variants.
 */
export async function assignVariantIfRandom(
  db: Prisma.TransactionClient,
  enrollment: { id: string; courseId: string }
): Promise<string | null> {
  const course = await db.course.findUnique({
    where: { id: enrollment.courseId },
    select: { familySlug: true, variantAssignment: true },
  });
  return course ? assignBalancedVariant(db, course, enrollment) : null;
}

/**
 * Catches enrolments that have no variant in a course that assigns them, for
 * example ones made before the course switched to RANDOM. Only enrolments that
 * have not completed a chapter yet get one, so nobody changes product mid-course.
 */
export async function withAssignedVariant<E extends { id: string; courseId: string; variantSlug: string | null; chaptersCompleted: number }>(
  course: AssigningCourse,
  enrollment: E
): Promise<E> {
  if (course.variantAssignment !== "RANDOM" || enrollment.variantSlug || enrollment.chaptersCompleted > 0) return enrollment;
  const variantSlug = await assignBalancedVariant(prisma, course, enrollment);
  return variantSlug ? { ...enrollment, variantSlug } : enrollment;
}

async function assignBalancedVariant(
  db: Prisma.TransactionClient,
  course: AssigningCourse,
  enrollment: { id: string; courseId: string }
): Promise<string | null> {
  const family = findCourseFamily(course.familySlug);
  if (!family || course.variantAssignment !== "RANDOM") return null;

  const current = await db.enrollment.findUnique({ where: { id: enrollment.id }, select: { variantSlug: true } });
  if (!current) return null;
  if (current.variantSlug) return current.variantSlug;

  const groups = await db.enrollment.groupBy({
    by: ["variantSlug"],
    where: { courseId: enrollment.courseId, variantSlug: { not: null } },
    _count: { _all: true },
  });
  const counts = Object.fromEntries(groups.map((group) => [group.variantSlug!, group._count._all]));
  const variant = pickBalancedVariant(family, counts);

  // Only fills an empty variant, so a concurrent assignment or pick is never overwritten.
  const { count } = await db.enrollment.updateMany({
    where: { id: enrollment.id, variantSlug: null },
    data: { variantSlug: variant.slug, variantChosenAt: new Date() },
  });
  if (count === 1) return variant.slug;
  const stored = await db.enrollment.findUnique({ where: { id: enrollment.id }, select: { variantSlug: true } });
  return stored?.variantSlug ?? null;
}

/**
 * Whether the variant is fixed for this user by the course. The course mentor
 * and admins can still switch, so they can preview every variant.
 */
export function variantAssignedFor(
  course: { variantAssignment: VariantAssignment; mentorId: string },
  user: { id: string; role: Role }
): boolean {
  return course.variantAssignment === "RANDOM" && !isMentorOfCourse(user.id, user.role, course);
}
