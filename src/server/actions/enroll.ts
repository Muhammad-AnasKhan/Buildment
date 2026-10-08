"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { requireVerifiedUser } from "@/server/auth/guards";
import {
  createSelfEnrollment,
  SelfEnrollmentError,
} from "@/server/enrollment/create-self-enrollment";
export async function selfEnrollInCourseAction(formData: FormData): Promise<void> {
  const user = await requireVerifiedUser();
  const courseId = String(formData.get("courseId") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "").trim();

  if (!courseId) throw new Error("Missing course.");

  try {
    const result = await createSelfEnrollment(prisma, { userId: user.id, courseId });
    revalidatePath("/my-courses");
    revalidatePath("/dashboard");
    revalidatePath("/catalog");

    if (result.lifecycle === "PAYMENT_REQUIRED") {
      redirect(`/courses/${result.courseSlug}/checkout`);
    }
    redirect(returnTo || `/courses/${result.courseSlug}`);
  } catch (error) {
    if (error instanceof SelfEnrollmentError) {
      if (error.code === "PAYMENT_PENDING") {
        const course = await prisma.course.findUnique({
          where: { id: courseId },
          select: { slug: true },
        });
        if (course) redirect(`/courses/${course.slug}/checkout`);
      }
      if (error.code === "ALREADY_ENROLLED") {
        const course = await prisma.course.findUnique({
          where: { id: courseId },
          select: { slug: true },
        });
        if (course) redirect(returnTo || `/courses/${course.slug}`);
      }
      throw new Error(error.message);
    }
    throw error;
  }
}

/** Simulates a successful checkout until Stripe is wired (Phase 5 stub). */
export async function completeEnrollmentPaymentStubAction(formData: FormData): Promise<void> {
  const user = await requireVerifiedUser();
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  if (!enrollmentId) throw new Error("Missing enrollment.");

  const enrollment = await prisma.enrollment.findFirst({
    where: { id: enrollmentId, userId: user.id },
    include: { course: { select: { slug: true } }, payment: true },
  });
  if (!enrollment) throw new Error("Enrollment not found.");
  if (enrollment.lifecycle !== "PAYMENT_REQUIRED") {
    redirect(`/courses/${enrollment.course.slug}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { enrollmentId: enrollment.id },
      data: {
        status: "SUCCEEDED",
        paidAt: new Date(),
        provider: "stub",
        providerRef: `stub_${Date.now()}`,
      },
    });
    await tx.enrollment.update({
      where: { id: enrollment.id },
      data: {
        lifecycle: "ACTIVE",
        status: "IN_PROGRESS",
        startedAt: enrollment.startedAt ?? new Date(),
      },
    });
  });

  revalidatePath("/my-courses");
  revalidatePath("/dashboard");
  redirect(`/courses/${enrollment.course.slug}`);
}
