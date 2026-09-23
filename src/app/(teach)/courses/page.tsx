import { requireRole } from "@/server/auth/guards";
import { loadMentorCourses } from "@/server/mentor-dashboard/load-courses";
import { CoursesHeader } from "@/components/teach/courses/courses-header";
import { CoursesSummary } from "@/components/teach/courses/courses-summary";
import { CoursesEmptyState } from "@/components/teach/courses/courses-empty-state";
import { CourseBrowser } from "@/components/teach/courses/course-browser";

export default async function MentorCourseListPage() {
  const user = await requireRole("MENTOR", "ADMIN");
  const view = await loadMentorCourses(user);

  return <div className="mx-auto max-w-7xl space-y-8">
    <CoursesHeader courseCount={view.summary.totalCourses} pendingReviews={view.summary.pendingReviews} />
    {view.courses.length ? <><CoursesSummary summary={view.summary} /><CourseBrowser courses={view.courses} /></> : <CoursesEmptyState />}
  </div>;
}
