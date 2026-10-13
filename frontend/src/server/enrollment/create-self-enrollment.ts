import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { lifecycleForSignedInEnrollment } from "@/server/enrollment/lifecycle";

export class SelfEnrollmentError extends Error {
  readonly code:
    | "COURSE_NOT_FOUND"
    | "NOT_PUBLISHED"
    | "ALREADY_ENROLLED"
    | "PAYMENT_PENDING";
  constructor(code: SelfEnrollmentError["code"], message: string) {
    super(message);
    this.name = "SelfEnrollmentError";
    this.code = code;
  }
}

export type SelfEnrollmentResult = {
  enrollmentId: string;
  courseSlug: string;
  lifecycle: ReturnType<typeof lifecycleForSignedInEnrollment>;
  created: boolean;
};

export async function createSelfEnrollment(
  db: PrismaClient,
  input: { userId: string; courseId: string }
): Promise<SelfEnrollmentResult> {
  const course = await db.course.findUnique({
    where: { id: input.courseId },
    select: {
      id: true,
      slug: true,
      status: true,
      pricingType: true,
      priceCents: true,
      currency: true,
    },
  });
  if (!course) throw new SelfEnrollmentError("COURSE_NOT_FOUND", "Course not found.");
  if (course.status !== "PUBLISHED") {
    throw new SelfEnrollmentError("NOT_PUBLISHED", "This course is not open for enrollment.");
  }

  const existing = await db.enrollment.findUnique({
    where: { courseId_userId: { courseId: course.id, userId: input.userId } },
  });
  if (existing) {
    if (existing.lifecycle === "PAYMENT_REQUIRED") {
      throw new SelfEnrollmentError("PAYMENT_PENDING", "Complete payment to access this course.");
    }
    throw new SelfEnrollmentError("ALREADY_ENROLLED", "You are already enrolled in this course.");
  }

  const lifecycle = lifecycleForSignedInEnrollment(course.pricingType);

  const enrollment = await db.$transaction(async (tx) => {
    const row = await tx.enrollment.create({
      data: {
        courseId: course.id,
        userId: input.userId,
        source: "SELF",
        lifecycle,
        status: lifecycle === "ACTIVE" ? "IN_PROGRESS" : "ASSIGNED",
        startedAt: lifecycle === "ACTIVE" ? new Date() : null,
      },
    });

    if (lifecycle === "PAYMENT_REQUIRED") {
      await tx.payment.create({
        data: {
          enrollmentId: row.id,
          amountCents: course.priceCents,
          currency: course.currency,
          status: "PENDING",
          provider: "stub",
        },
      });
    }

    return row;
  });

  return {
    enrollmentId: enrollment.id,
    courseSlug: course.slug,
    lifecycle,
    created: true,
  };
}
