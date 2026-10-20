import type { MentorCoursesView } from "@/shared/api/teach";
import { requireTeachSurface } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";
import { CoursesHeader } from "@/components/teach/courses/courses-header";
import { CoursesSummary } from "@/components/teach/courses/courses-summary";
import { CoursesEmptyState } from "@/components/teach/courses/courses-empty-state";
import { CourseBrowser } from "@/components/teach/courses/course-browser";

export default async function MentorCourseListPage() {
  await requireTeachSurface();
  const view = await serverApiFetch<MentorCoursesView>("/api/v1/teach/courses");

  return <div className="mx-auto max-w-7xl space-y-8">
    <CoursesHeader courseCount={view.summary.totalCourses} pendingReviews={view.summary.pendingReviews} zipImportEnabled={view.zipImportEnabled} />
    {view.courses.length ? <><CoursesSummary summary={view.summary} /><CourseBrowser courses={view.courses} /></> : <CoursesEmptyState />}
  </div>;
}
