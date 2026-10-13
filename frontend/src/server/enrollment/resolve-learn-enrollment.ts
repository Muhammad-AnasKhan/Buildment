import "server-only";
import { notFound } from "next/navigation";
import type { Enrollment, Role } from "@/generated/prisma/client";
import { prisma } from "@/server/db";
import { isMentorOfCourse } from "@/server/auth/access-rules";
import { enrollmentGrantsContentAccess } from "@/server/enrollment/lifecycle";

export type LearnAccessDenial =
  | "not_enrolled"
  | "payment_required"
  | "pending_account"
  | "inactive";

export function learnAccessDenial(
  enrollment: Pick<Enrollment, "lifecycle" | "userId"> | null
): LearnAccessDenial | null {
  if (!enrollment) return "not_enrolled";
  if (!enrollment.userId) return "pending_account";
  if (enrollment.lifecycle === "PAYMENT_REQUIRED") return "payment_required";
  if (!enrollmentGrantsContentAccess(enrollment.lifecycle)) return "inactive";
  return null;
}

/** Active enrollment for chapter read + block submit (creates instructor preview enrollment when needed). */
export async function resolveLearnEnrollment(
  user: { id: string; role: Role },
  courseId: string
): Promise<Enrollment> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, mentorId: true },
  });
  if (!course) notFound();

  let enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId, userId: user.id } },
  });

  if (!enrollment && isMentorOfCourse(user.id, user.role, course)) {
    enrollment = await prisma.enrollment.create({
      data: {
        courseId,
        userId: user.id,
        lifecycle: "ACTIVE",
        status: "IN_PROGRESS",
        source: "DIRECT",
        startedAt: new Date(),
      },
    });
  }

  const denial = learnAccessDenial(enrollment);
  if (denial) {
    const err = new LearnAccessError(denial);
    throw err;
  }

  return enrollment!;
}

export class LearnAccessError extends Error {
  readonly code: LearnAccessDenial;
  constructor(code: LearnAccessDenial) {
    super(`Learn access denied: ${code}`);
    this.name = "LearnAccessError";
    this.code = code;
  }
}
