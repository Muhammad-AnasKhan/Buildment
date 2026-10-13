"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ENROLLMENT_ERROR_CODES, type SelfEnrollResult } from "@/shared/api/catalog";
import { safeRedirectTo } from "@/shared/lib/safe-redirect";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";

function refreshLearnerPages() {
  revalidatePath("/my-courses");
  revalidatePath("/dashboard");
  revalidatePath("/catalog");
}

export async function selfEnrollInCourseAction(formData: FormData): Promise<void> {
  const courseId = String(formData.get("courseId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const returnTo = safeRedirectTo(String(formData.get("returnTo") ?? "").trim());
  if (!courseId || !courseSlug) throw new Error("Missing course.");

  let result: SelfEnrollResult;
  try {
    result = await serverApiFetch<SelfEnrollResult>("/api/v1/enrollments", { method: "POST", json: { courseId } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      // Already enrolled or awaiting payment: send the learner where they can continue.
      if (error.code === ENROLLMENT_ERROR_CODES.PAYMENT_PENDING) redirect(`/courses/${courseSlug}/checkout`);
      if (error.code === ENROLLMENT_ERROR_CODES.ALREADY_ENROLLED) redirect(returnTo ?? `/courses/${courseSlug}`);
      throw new Error(error.message);
    }
    throw error;
  }

  refreshLearnerPages();
  if (result.lifecycle === "PAYMENT_REQUIRED") {
    redirect(`/courses/${result.courseSlug}/checkout`);
  }
  redirect(returnTo ?? `/courses/${result.courseSlug}`);
}

/** Simulates a successful checkout until a payment provider is wired. */
export async function completeEnrollmentPaymentStubAction(formData: FormData): Promise<void> {
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  if (!enrollmentId) throw new Error("Missing enrollment.");

  const result = await serverApiFetch<{ courseSlug: string }>(`/api/v1/enrollments/${enrollmentId}/payment-stub`, {
    method: "POST",
  });
  refreshLearnerPages();
  redirect(`/courses/${result.courseSlug}`);
}
