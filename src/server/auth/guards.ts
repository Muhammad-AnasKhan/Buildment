import "server-only";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { auth } from "./auth";
import {
  ensureUserEmailVerified,
  isEmailVerified,
  resolveEmailVerifiedForUser,
  shouldAutoVerifyWithoutEmailDelivery,
} from "./email-verification";
import {
  canAccessLearnSurface,
  canAccessRole,
  canAccessTeachSurface,
  homeRouteForRole,
  isMentorOfCourse,
  surfaceHomeRoute,
  userCanInstruct,
} from "./access-rules";
import { getActiveSurface } from "./surface";
import { ensureSeedTestUserVerified, shouldAutoVerifySeedTestUser } from "./seed-test-users";
import { canAccessHelpThread } from "@/server/help/access";
import {
  LearnAccessError,
  resolveLearnEnrollment,
} from "@/server/enrollment/resolve-learn-enrollment";

export {
  canAccessLearnSurface,
  canAccessRole,
  canAccessTeachSurface,
  homeRouteForRole,
  isMentorOfCourse,
  surfaceHomeRoute,
  userCanInstruct,
} from "./access-rules";

// The single place authorization is decided — see docs/09-security.mdx.
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

/** Signed-in user with a verified email — required for learner/instructor product surfaces. */
export async function requireVerifiedUser() {
  const user = await requireUser();
  if (user.role === "ADMIN") return user;
  if (!isEmailVerified(user.emailVerified)) {
    if (shouldAutoVerifySeedTestUser(user.email)) {
      const verifiedAt = await ensureSeedTestUserVerified(user.email!);
      if (verifiedAt) {
        return { ...user, emailVerified: verifiedAt };
      }
    }
    if (shouldAutoVerifyWithoutEmailDelivery()) {
      const verifiedAt = await ensureUserEmailVerified(user.id);
      if (verifiedAt) {
        return { ...user, emailVerified: verifiedAt };
      }
    }
    const verifiedAt = await resolveEmailVerifiedForUser(user);
    if (verifiedAt) {
      return { ...user, emailVerified: verifiedAt };
    }
    redirect("/verify-email");
  }
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

/** Learner workspace — any signed-in user except platform admin shell. */
export async function requireLearnSurface() {
  const user = await requireVerifiedUser();
  if (!canAccessLearnSurface(user)) {
    redirect("/admin");
  }
  const canInstruct = userCanInstruct(user);
  const surface = await getActiveSurface(canInstruct);
  if (surface !== "learn") {
    redirect(surfaceHomeRoute("teach"));
  }
  return user;
}

/** Instructor workspace — requires instructor capability and teach surface. */
export async function requireTeachSurface() {
  const user = await requireVerifiedUser();
  if (!canAccessTeachSurface(user)) {
    redirect(surfaceHomeRoute("learn"));
  }
  const canInstruct = userCanInstruct(user);
  const surface = await getActiveSurface(canInstruct);
  if (surface !== "teach") {
    redirect(surfaceHomeRoute("learn"));
  }
  return user;
}

/** Throws ForbiddenError (never silently no-ops) if the signed-in user doesn't mentor this course. */
export async function requireMentorOfCourse(courseId: string) {
  const user = await requireTeachSurface();
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

/** Throws if the user cannot read chapters or submit block responses for this course. */
export async function requireEnrolledMentee(courseId: string) {
  const user = await requireVerifiedUser();
  try {
    const enrollment = await resolveLearnEnrollment(user, courseId);
    return { user, enrollment };
  } catch (error) {
    if (error instanceof LearnAccessError) {
      throw new ForbiddenError(`Learn access denied (${error.code})`);
    }
    throw error;
  }
}

/** Enrollment row for the signed-in user, including payment-pending states. */
export async function getEnrollmentForUser(courseId: string, userId: string) {
  return prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId, userId } },
  });
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
