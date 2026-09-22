import "server-only";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { auth } from "./auth";
import { canAccessRole, homeRouteForRole, isMentorOfCourse } from "./access-rules";
import { canAccessHelpThread } from "@/server/help/access";

export { canAccessRole, homeRouteForRole, isMentorOfCourse } from "./access-rules";

// The single place authorization is decided — see .cursor/rules/project-invariants.mdc.
// Route handlers, server actions, and layouts call these instead of checking
// session/role/ownership themselves.

export class ForbiddenError extends Error {}

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Redirects to /login if there's no session. Use in layouts/pages/actions that require any signed-in user. */
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/** Redirects to that role's home if the signed-in user doesn't have one of `allowed`. */
export async function requireRole(...allowed: readonly ["MENTOR" | "MENTEE" | "ADMIN", ...("MENTOR" | "MENTEE" | "ADMIN")[]]) {
  const user = await requireUser();
  if (!canAccessRole(user.role, allowed)) {
    redirect(homeRouteForRole(user.role));
  }
  return user;
}

/** Throws ForbiddenError (never silently no-ops) if the signed-in user doesn't mentor this course. */
export async function requireMentorOfCourse(courseId: string) {
  const user = await requireRole("MENTOR", "ADMIN");
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { mentorId: true },
  });
  if (!course) notFound();
  if (!isMentorOfCourse(user.id, user.role, course)) {
    throw new ForbiddenError(`User ${user.id} does not mentor course ${courseId}`);
  }
  return user;
}

/** Throws ForbiddenError if the signed-in user isn't enrolled in this course. */
export async function requireEnrolledMentee(courseId: string) {
  const user = await requireUser();
  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId, userId: user.id } },
  });
  if (!enrollment) {
    throw new ForbiddenError(`User ${user.id} is not enrolled in course ${courseId}`);
  }
  return { user, enrollment };
}

/** Throws ForbiddenError if the user cannot read this help thread (mentee owner or course mentor). */
export async function requireHelpThreadAccess(threadId: string) {
  const user = await requireUser();
  const thread = await prisma.helpThread.findUnique({
    where: { id: threadId },
    include: {
      course: { select: { id: true, slug: true, title: true, mentorId: true } },
      chapter: { select: { id: true, slug: true, title: true } },
      mentee: { select: { id: true, name: true, email: true } },
    },
  });
  if (!thread) notFound();
  if (!canAccessHelpThread(user, thread, thread.course)) {
    throw new ForbiddenError(`User ${user.id} cannot access help thread ${threadId}`);
  }
  return { user, thread };
}
