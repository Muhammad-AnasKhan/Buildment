import { prisma } from "../../db/prisma.js";
import { ForbiddenError, NotFoundError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import { isMentorOfCourse } from "../auth/access-rules.js";

// Course ownership is decided here and nowhere else in the teach services:
// admins may act on any course, mentors only on their own. 404 when the course
// does not exist, 403 when it belongs to someone else.

export type OwnedCourse = { id: string; slug: string; title: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; mentorId: string };

const ownedSelect = { id: true, slug: true, title: true, status: true, mentorId: true } as const;

function assertOwner(user: SessionUser, course: OwnedCourse | null): OwnedCourse {
  if (!course) throw new NotFoundError("Course not found");
  if (!isMentorOfCourse(user.id, user.role, course)) {
    throw new ForbiddenError("You do not mentor this course.", "NOT_COURSE_MENTOR");
  }
  return course;
}

export async function requireCourseById(user: SessionUser, courseId: string): Promise<OwnedCourse> {
  return assertOwner(user, await prisma.course.findUnique({ where: { id: courseId }, select: ownedSelect }));
}

export async function requireCourseBySlug(user: SessionUser, courseSlug: string): Promise<OwnedCourse> {
  return assertOwner(user, await prisma.course.findUnique({ where: { slug: courseSlug }, select: ownedSelect }));
}

/** Prisma `where` that scopes course queries to what this user may see. */
export function mentoredCoursesWhere(user: SessionUser) {
  return user.role === "ADMIN" ? {} : { mentorId: user.id };
}
