import "server-only";
import { isEmailVerified } from "@/server/auth/email-verification";
import type { getSessionUser } from "@/server/auth/guards";
import {
  LearnAccessError,
  learnAccessDenial,
  resolveLearnEnrollment,
} from "@/server/enrollment/resolve-learn-enrollment";
import { prisma } from "@/server/db";

type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;

export type BlockApiAccessResult =
  | { ok: true; enrollment: Awaited<ReturnType<typeof resolveLearnEnrollment>>; user: SessionUser }
  | { ok: false; status: number; error: string; code?: string };

/** Shared gate for `/api/blocks/.../respond` and quiz submit routes. */
export async function requireBlockSubmissionAccess(
  courseId: string,
  user: SessionUser | null
): Promise<BlockApiAccessResult> {
  if (!user) {
    return { ok: false, status: 401, error: "Not signed in" };
  }
  if (user.role !== "ADMIN" && !isEmailVerified(user.emailVerified)) {
    return { ok: false, status: 403, error: "Verify your email before submitting checkpoints." };
  }

  try {
    const enrollment = await resolveLearnEnrollment(user, courseId);
    return { ok: true, enrollment, user };
  } catch (error) {
    if (error instanceof LearnAccessError) {
      const messages: Record<LearnAccessError["code"], string> = {
        not_enrolled: "Not enrolled in this course",
        payment_required: "Complete payment to submit checkpoints for this course",
        pending_account: "Link your account before submitting checkpoints",
        inactive: "This enrollment is not active",
      };
      return {
        ok: false,
        status: 403,
        error: messages[error.code],
        code: error.code,
      };
    }
    throw error;
  }
}

/** Read-only enrollment lookup for block SSR (initial response state). */
export async function findEnrollmentForBlockState(courseId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId, userId } },
    select: { id: true, lifecycle: true, userId: true },
  });
  if (learnAccessDenial(enrollment)) return null;
  return enrollment;
}
