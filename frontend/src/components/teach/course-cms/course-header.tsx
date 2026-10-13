import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPriceDisplay } from "@/server/courses/publish-rules";
import { publishCourse, restoreCourseToDraft, unpublishCourse } from "@/server/actions/courses";
import type { CourseBuilderCourse } from "./types";

export function CourseHeader({
  course,
  publishError,
}: {
  course: CourseBuilderCourse;
  publishError?: string;
}) {
  const chapterCount = course.modules.reduce(
    (total, module) => total + module.chapters.length,
    0
  );
  const publishedCount = course.modules.reduce(
    (total, module) =>
      total + module.chapters.filter((chapter) => chapter.publishedAt).length,
    0
  );

  const priceLabel =
    course.pricingType === "PAID" && course.priceCents > 0
      ? formatPriceDisplay(course.priceCents, course.currency)
      : "Free";

  return (
    <header className="space-y-4">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All courses
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={course.status === "PUBLISHED" ? "default" : "secondary"}>
              {course.status === "PUBLISHED"
                ? "Published"
                : course.status === "ARCHIVED"
                  ? "Archived"
                  : "Draft"}
            </Badge>
            <Badge variant="outline">{priceLabel}</Badge>
            <span className="text-xs text-muted-foreground">
              {course.modules.length} module{course.modules.length === 1 ? "" : "s"} ·{" "}
              {publishedCount}/{chapterCount} chapters published
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {course.title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Build the curriculum, configure learning rules, then open each chapter to author its
              content and activities.
            </p>
          </div>
        </div>

        <nav aria-label="Course tools" className="flex flex-wrap items-center gap-2">
          <Link
            href={`/courses/${course.slug}/reports`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            <BarChart3 /> Reports
          </Link>
          <Link
            href={`/courses/${course.slug}/mentees`}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            <Users /> Learners
          </Link>
        </nav>
      </div>

      {course.status === "DRAFT" ? (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">This course is not on the catalog yet</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Publish when at least one chapter is published and pricing is configured.
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              const result = await publishCourse({ courseId: course.id });
              if (!result.ok) {
                redirect(
                  `/courses/${course.slug}/edit?publishError=${encodeURIComponent(result.errors.join(" "))}`
                );
              }
            }}
          >
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Publish course
            </Button>
          </form>
        </div>
      ) : null}

      {course.status === "ARCHIVED" ? (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">This course is archived</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              New enrollments and organization allocations are blocked. Existing learners keep
              access.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <form
              action={async () => {
                "use server";
                await restoreCourseToDraft({ courseId: course.id });
              }}
            >
              <Button type="submit" variant="outline" size="lg">
                Move to draft
              </Button>
            </form>
            <form
              action={async () => {
                "use server";
                const result = await publishCourse({ courseId: course.id });
                if (!result.ok) {
                  redirect(
                    `/courses/${course.slug}/edit?publishError=${encodeURIComponent(result.errors.join(" "))}`
                  );
                }
              }}
            >
              <Button type="submit" size="lg">
                Publish again
              </Button>
            </form>
          </div>
        </div>
      ) : null}

      {course.status === "PUBLISHED" ? (
        <div className="rounded-xl border bg-card p-4">
          {course.enrollmentCount > 0 ? (
            <p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                {course.enrollmentCount} learner{course.enrollmentCount === 1 ? "" : "s"}{" "}
                enrolled. Publishing chapter edits makes them visible immediately.
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              The course is live for new enrollments (free or paid per your pricing settings).
            </p>
          )}
          <details className="mt-3">
            <summary className="w-fit cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
              Archive or unpublish…
            </summary>
            <form
              className="mt-3 flex flex-col items-start gap-3"
              action={async (formData) => {
                "use server";
                const result = await unpublishCourse({
                  courseId: course.id,
                  confirmedWithEnrollments: formData.get("confirm") === "on",
                });
                if (!result.ok) {
                  redirect(
                    `/courses/${course.slug}/edit?publishError=${encodeURIComponent(result.errors.join(" "))}`
                  );
                }
              }}
            >
              {course.enrollmentCount > 0 ? (
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    name="confirm"
                    className="mt-0.5 size-4 rounded border-input accent-primary"
                  />
                  Archive this course — enrolled learners keep access; new enrollments stop.
                </label>
              ) : (
                <p className="text-xs text-muted-foreground">
                  With no enrollments, this returns the course to draft.
                </p>
              )}
              <Button type="submit" variant="destructive" size="sm">
                {course.enrollmentCount > 0 ? "Archive course" : "Unpublish to draft"}
              </Button>
            </form>
          </details>
        </div>
      ) : null}

      {publishError ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {publishError}
        </p>
      ) : null}
    </header>
  );
}
