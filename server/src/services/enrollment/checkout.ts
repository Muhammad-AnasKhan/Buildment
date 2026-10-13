import type { Checkout } from "@buildment/shared/api/catalog";
import { prisma } from "../../db/prisma.js";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import { enrollmentGrantsContentAccess } from "./lifecycle.js";

export async function loadCheckout(courseSlug: string, userId: string): Promise<Checkout> {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: { id: true, slug: true, title: true, pricingType: true, priceCents: true, currency: true, status: true },
  });
  if (!course || course.status !== "PUBLISHED") throw new NotFoundError("Course not found");
  const { status: _status, ...courseFields } = course;

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId: course.id, userId } },
    select: { id: true, lifecycle: true },
  });
  if (!enrollment) return { course: courseFields, enrollment: null, state: "no_enrollment" };
  if (enrollmentGrantsContentAccess(enrollment.lifecycle)) {
    return { course: courseFields, enrollment, state: "already_paid" };
  }
  if (enrollment.lifecycle !== "PAYMENT_REQUIRED") throw new NotFoundError("Enrollment is not awaiting payment");
  return { course: courseFields, enrollment, state: "payment_required" };
}

/** Simulates a successful checkout until a payment provider is wired. */
export async function completePaymentStub(enrollmentId: string, userId: string): Promise<{ courseSlug: string; alreadyActive: boolean }> {
  const enrollment = await prisma.enrollment.findFirst({
    where: { id: enrollmentId, userId },
    include: { course: { select: { slug: true } }, payment: true },
  });
  if (!enrollment) throw new NotFoundError("Enrollment not found");
  if (enrollment.lifecycle !== "PAYMENT_REQUIRED") {
    if (enrollmentGrantsContentAccess(enrollment.lifecycle)) return { courseSlug: enrollment.course.slug, alreadyActive: true };
    throw new ConflictError("This enrollment is not awaiting payment");
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { enrollmentId: enrollment.id },
      data: { status: "SUCCEEDED", paidAt: new Date(), provider: "stub", providerRef: `stub_${Date.now()}` },
    });
    await tx.enrollment.update({
      where: { id: enrollment.id },
      data: { lifecycle: "ACTIVE", status: "IN_PROGRESS", startedAt: enrollment.startedAt ?? new Date() },
    });
  });

  return { courseSlug: enrollment.course.slug, alreadyActive: false };
}
