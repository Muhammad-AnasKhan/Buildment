import { redirect } from "next/navigation";
import type { CourseOverview } from "@/shared/api/catalog";
import { findCourseFamily } from "@/shared/lib/course-tracks";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { CourseVariantContent } from "@buildment/learning-ui/components/learn/course-variant-content";
import { chooseCourseVariantAction } from "@/server/actions/course-track";
import { WebCourseNavigation } from "@/components/learn/course-navigation";

export default async function CourseVariantPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;

  await requireLearnSurface();
  const overview = await serverApiFetchOrNotFound<CourseOverview>(`/api/v1/courses/${encodeURIComponent(courseSlug)}/overview`);
  const { course, track } = overview;
  const family = track?.family ?? findCourseFamily(track?.familySlug);
  if (overview.access !== "active" || !track || !family || track.variantLocked) redirect(`/courses/${course.slug}`);
  return <WebCourseNavigation><CourseVariantContent overview={overview} onChoose={chooseCourseVariantAction} /></WebCourseNavigation>;
}
