import { prisma } from "../../db/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";
import { ForbiddenError, NotFoundError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";

// Instructor access is scoped to courses the caller owns or teaches, including
// when the caller is an admin. Platform-wide administration uses admin routes.
// Return 404 when a course does not exist and 403 when it is outside that scope.

export type OwnedCourse = { id: string; slug: string; title: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; mentorId: string };

const ownedSelect = { id: true, slug: true, title: true, status: true, mentorId: true } as const;

async function assertOwner(user: SessionUser, course: OwnedCourse | null, access: "COURSE_CREATOR" | "SUBMISSION_EVALUATOR" = "COURSE_CREATOR"): Promise<OwnedCourse> {
  if (!course) throw new NotFoundError("Course not found");
  if (user.role !== "MENTOR" && user.role !== "ADMIN") throw new ForbiddenError("You do not have access to this course.", "NOT_COURSE_MENTOR");
  if (course.mentorId === user.id) return course;
  const membership = await prisma.courseInstructor.findFirst({
    where: { courseId: course.id, userId: user.id, ...(access === "COURSE_CREATOR" ? { role: "COURSE_CREATOR" } : {}) },
    select: { id: true },
  });
  if (!membership) throw new ForbiddenError("You do not mentor this course.", "NOT_COURSE_MENTOR");
  return course;
}

export async function requireCourseById(user: SessionUser, courseId: string, access: "COURSE_CREATOR" | "SUBMISSION_EVALUATOR" = "COURSE_CREATOR"): Promise<OwnedCourse> {
  return assertOwner(user, await prisma.course.findUnique({ where: { id: courseId }, select: ownedSelect }), access);
}

export async function requireCourseBySlug(user: SessionUser, courseSlug: string, access: "COURSE_CREATOR" | "SUBMISSION_EVALUATOR" = "COURSE_CREATOR"): Promise<OwnedCourse> {
  return assertOwner(user, await prisma.course.findUnique({ where: { slug: courseSlug }, select: ownedSelect }), access);
}

/** Prisma `where` that scopes course queries to what this user may see. */
export function mentoredCoursesWhere(user: SessionUser, access: "COURSE_CREATOR" | "SUBMISSION_EVALUATOR" = "COURSE_CREATOR"): Prisma.CourseWhereInput {
  const membership: Prisma.CourseInstructorWhereInput = access === "COURSE_CREATOR"
    ? { userId: user.id, role: "COURSE_CREATOR" }
    : { userId: user.id };
  return {
    OR: [
      { mentorId: user.id },
      { instructors: { some: membership } },
    ],
  };
}
