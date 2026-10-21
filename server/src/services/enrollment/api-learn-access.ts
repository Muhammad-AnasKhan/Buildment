import { prisma } from "../../db/prisma.js";
import { ForbiddenError, UnauthorizedError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import { isEmailVerified } from "../auth/email-verification.js";
import {
  LearnAccessError,
  learnAccessDenial,
  resolveLearnEnrollment,
  type LearnAccessDenial,
} from "./resolve-learn-enrollment.js";

const DENIAL_MESSAGES: Record<LearnAccessDenial, string> = {
  not_enrolled: "Not enrolled in this course",
  payment_required: "Complete payment to submit checkpoints for this course",
  pending_account: "Link your account before submitting checkpoints",
  inactive: "This enrollment is not active",
};

/**
 * Shared gate for block submissions and quiz submits: the user must be signed in,
 * email-verified (admins exempt) and hold an active enrollment. Returns the
 * enrollment or throws a 401/403 with a stable code the client can branch on.
 */
export async function requireBlockSubmissionAccess(courseId: string, user: SessionUser | undefined) {
  if (!user) throw new UnauthorizedError("Not signed in");

  if (user.role !== "ADMIN" && !isEmailVerified(user.emailVerified)) {
    // The session may predate verification; trust the database over the token.
    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { emailVerified: true } });
    if (dbUser && isEmailVerified(dbUser.emailVerified)) {
      user.emailVerified = dbUser.emailVerified;
    }
  }
  if (user.role !== "ADMIN" && !isEmailVerified(user.emailVerified)) {
    throw new ForbiddenError("Verify your email before submitting checkpoints.", "EMAIL_UNVERIFIED");
  }

  try {
    return await resolveLearnEnrollment(user, courseId);
  } catch (error) {
    if (error instanceof LearnAccessError) {
      throw new ForbiddenError(DENIAL_MESSAGES[error.code], error.code);
    }
    throw error;
  }
}

/** Read-only enrollment lookup for block state (initial response state and the learner's variant). */
export async function findEnrollmentForBlockState(courseId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId, userId } },
    select: { id: true, lifecycle: true, userId: true, variantSlug: true },
  });
  if (learnAccessDenial(enrollment)) return null;
  return enrollment;
}
