import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ENROLLMENT_ERROR_CODES, type CatalogCourseDetail, type SelfEnrollResult } from "@/shared/api/catalog";
import { getSessionUser } from "@/server/auth/guards";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";
import {
  PENDING_ENGAGEMENT_COOKIE,
  PENDING_ENGAGEMENT_MAX_AGE_SECONDS,
  formatPendingEnrollment,
} from "@/lib/engagement/pending-event";

// One link from a public course page into the course: sign-up and sign-in return here, the learner
// is enrolled, and the first lesson opens. Paid courses go to checkout instead.
export async function GET(_request: Request, { params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const here = `/enroll/${encodeURIComponent(courseSlug)}`;
  const user = await getSessionUser();
  if (!user) redirect(`/signup?redirectTo=${encodeURIComponent(here)}`);
  if (user.role !== "ADMIN" && !user.emailVerified) redirect("/verify-email");

  let course: CatalogCourseDetail;
  try {
    course = await serverApiFetch<CatalogCourseDetail>(`/api/v1/catalog/${encodeURIComponent(courseSlug)}`);
  } catch {
    redirect("/catalog");
  }
  const start = `/courses/${course.slug}?start=1`;
  if (course.access === "active") redirect(start);
  if (course.access === "payment_required") redirect(`/courses/${course.slug}/checkout`);

  let result: SelfEnrollResult;
  try {
    result = await serverApiFetch<SelfEnrollResult>("/api/v1/enrollments", { method: "POST", json: { courseId: course.id } });
  } catch (error) {
    if (error instanceof ApiError && error.code === ENROLLMENT_ERROR_CODES.PAYMENT_PENDING) redirect(`/courses/${course.slug}/checkout`);
    if (error instanceof ApiError && error.code === ENROLLMENT_ERROR_CODES.ALREADY_ENROLLED) redirect(start);
    // Courses that need an invite or a mentor cannot be joined here; show the course page.
    redirect(`/catalog/${course.slug}`);
  }
  if (result.lifecycle === "PAYMENT_REQUIRED") redirect(`/courses/${course.slug}/checkout`);

  // Dot greets the new enrollment on the next page, as after the enroll button.
  const pending = formatPendingEnrollment(course.id);
  if (pending) {
    (await cookies()).set(PENDING_ENGAGEMENT_COOKIE, pending, {
      path: "/",
      maxAge: PENDING_ENGAGEMENT_MAX_AGE_SECONDS,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  redirect(start);
}
