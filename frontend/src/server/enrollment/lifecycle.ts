import type { CoursePricingType, EnrollmentLifecycle } from "@/generated/prisma/client";

/** Whether the learner may open chapters and submit work. */
export function enrollmentGrantsContentAccess(lifecycle: EnrollmentLifecycle): boolean {
  return lifecycle === "ACTIVE" || lifecycle === "COMPLETED";
}

/** Signed-in direct enrollment (self-serve, invite, or linked Pathment account). */
export function lifecycleForSignedInEnrollment(pricingType: CoursePricingType): EnrollmentLifecycle {
  return pricingType === "PAID" ? "PAYMENT_REQUIRED" : "ACTIVE";
}

/** Pathment row before the learner has a Buildment account. */
export function lifecycleForPathmentEnrollment(
  pricingType: CoursePricingType,
  hasUser: boolean
): EnrollmentLifecycle {
  if (!hasUser) return "PENDING_ACCOUNT";
  return lifecycleForSignedInEnrollment(pricingType);
}
