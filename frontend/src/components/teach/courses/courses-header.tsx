import { CourseCreationDialog } from "./course-creation-dialog";

export function CoursesHeader({ courseCount, pendingReviews, zipImportEnabled }: { courseCount: number; pendingReviews: number; zipImportEnabled: boolean }) {
  return <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Mentor workspace</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your courses</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Monitor learner progress, handle reviews, and keep every course moving from one focused workspace.</p>
      <p className="mt-3 text-xs font-medium text-muted-foreground">{courseCount} course{courseCount === 1 ? "" : "s"}{pendingReviews > 0 ? ` · ${pendingReviews} answers to check` : ""}</p>
    </div>
    <CourseCreationDialog zipImportEnabled={zipImportEnabled} />
  </header>;
}
