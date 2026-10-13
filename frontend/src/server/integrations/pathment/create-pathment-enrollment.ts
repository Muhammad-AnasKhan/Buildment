import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import {
  assertOrganizationCourseAllocation,
  consumeEnrollmentSlot,
} from "@/server/integrations/allocation";
import { pathmentAssignmentId } from "@/server/integrations/pathment/enrollment-idempotency";
import { lifecycleForPathmentEnrollment } from "@/server/enrollment/lifecycle";
import {
  pathmentEnrollmentPatch,
  shouldAttachPathmentOrg,
} from "@/server/integrations/pathment/attach-org-enrollment";

export type PathmentEnrollmentInput = {
  organizationId: string;
  courseId: string;
  studentEmail: string;
  mentorId?: string | null;
  externalAssignmentId?: string | null;
};

export class PathmentEnrollmentError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "PathmentEnrollmentError";
    this.status = status;
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function createPathmentEnrollment(
  db: PrismaClient,
  input: PathmentEnrollmentInput
) {
  const email = normalizeEmail(input.studentEmail);
  if (!email.includes("@")) {
    throw new PathmentEnrollmentError(400, "Invalid student_email");
  }

  const assignmentId = pathmentAssignmentId({
    organizationId: input.organizationId,
    courseId: input.courseId,
    studentEmail: email,
    mentorId: input.mentorId,
    externalAssignmentId: input.externalAssignmentId,
  });

  const existing = await db.enrollment.findFirst({
    where: {
      organizationId: input.organizationId,
      source: "PATHMENT",
      externalAssignmentId: assignmentId,
    },
    include: { learnerProfile: true, course: true },
  });
  if (existing) {
    return { enrollment: existing, created: false as const };
  }

  const course = await db.course.findUnique({ where: { id: input.courseId } });
  if (!course || course.status !== "PUBLISHED") {
    throw new PathmentEnrollmentError(404, "Course not found or not published");
  }

  const allocation = await db.organizationCourse.findUnique({
    where: {
      organizationId_courseId: {
        organizationId: input.organizationId,
        courseId: input.courseId,
      },
    },
  });
  assertOrganizationCourseAllocation(allocation);

  const linkedUser = await db.user.findUnique({ where: { email } });
  if (linkedUser) {
    const byUser = await db.enrollment.findUnique({
      where: { courseId_userId: { courseId: input.courseId, userId: linkedUser.id } },
    });
    if (byUser) {
      if (!shouldAttachPathmentOrg(byUser.organizationId, input.organizationId)) {
        throw new PathmentEnrollmentError(
          409,
          "Learner is enrolled through a different organization"
        );
      }
      if (
        !byUser.organizationId ||
        !byUser.externalAssignmentId ||
        byUser.externalAssignmentId !== assignmentId
      ) {
        const updated = await db.enrollment.update({
          where: { id: byUser.id },
          data: pathmentEnrollmentPatch({
            organizationId: input.organizationId,
            mentorId: input.mentorId,
            assignmentId,
          }),
          include: { course: true, learnerProfile: true },
        });
        return { enrollment: updated, created: false as const };
      }
      return { enrollment: byUser, created: false as const };
    }
  }

  return db.$transaction(async (tx) => {
    const freshAllocation = await tx.organizationCourse.findUnique({
      where: {
        organizationId_courseId: {
          organizationId: input.organizationId,
          courseId: input.courseId,
        },
      },
    });
    assertOrganizationCourseAllocation(freshAllocation!);
    await consumeEnrollmentSlot(tx, freshAllocation!.id);

    const learnerProfile = await tx.learnerProfile.upsert({
      where: { email },
      create: { email, userId: linkedUser?.id ?? null, linkedAt: linkedUser ? new Date() : null },
      update: linkedUser
        ? { userId: linkedUser.id, linkedAt: new Date() }
        : {},
    });

    const lifecycle = lifecycleForPathmentEnrollment(course.pricingType, Boolean(linkedUser));

    const enrollment = await tx.enrollment.create({
      data: {
        courseId: course.id,
        userId: linkedUser?.id ?? null,
        learnerProfileId: learnerProfile.id,
        organizationId: input.organizationId,
        lifecycle,
        source: "PATHMENT",
        externalMentorId: input.mentorId?.trim() || null,
        externalAssignmentId: assignmentId,
        status: lifecycle === "ACTIVE" ? "IN_PROGRESS" : "ASSIGNED",
      },
      include: { course: true, learnerProfile: true },
    });

    if (course.pricingType === "PAID" && linkedUser && lifecycle === "PAYMENT_REQUIRED") {
      await tx.payment.create({
        data: {
          enrollmentId: enrollment.id,
          amountCents: course.priceCents,
          currency: course.currency,
          status: "PENDING",
        },
      });
    }

    return { enrollment, created: true as const };
  });
}
