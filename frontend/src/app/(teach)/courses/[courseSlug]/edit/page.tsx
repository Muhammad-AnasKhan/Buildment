import type { CourseBuilderView } from "@/shared/api/teach";
import { CourseHeader } from "@/components/teach/course-cms/course-header";
import { CurriculumBuilder } from "@/components/teach/course-cms/curriculum-builder";
import { requireTeachSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";

export default async function CourseEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ publishError?: string }>;
}) {
  const { courseSlug } = await params;
  const query = await searchParams;
  await requireTeachSurface();

  // The API answers 404 for unknown courses and 403 for someone else's.
  const { course, looseChapters } = await serverApiFetchOrNotFound<CourseBuilderView>(
    `/api/v1/teach/courses/${encodeURIComponent(courseSlug)}/builder`
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-1 pb-16 sm:px-2">
      <CourseHeader course={course} publishError={query.publishError} />

      <CurriculumBuilder course={course} looseChapters={looseChapters} />
    </div>
  );
}
