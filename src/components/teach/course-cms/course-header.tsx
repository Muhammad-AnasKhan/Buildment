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
import { publishCourse, unpublishCourse } from "@/server/actions/courses";
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
            <Users /> Mentees
          </Link>
        </nav>
      </div>

      {course.status !== "PUBLISHED" ? (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">This course is not visible yet</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Publish when the curriculum is ready for invitations and assignments.
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await publishCourse({ courseId: course.id });
            }}
          >
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Publish course
            </Button>
          </form>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-4">
          {course.enrollmentCount > 0 ? (
            <p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                {course.enrollmentCount} mentee{course.enrollmentCount === 1 ? " is" : "s are"}{" "}
                enrolled. Publishing chapter edits makes them visible immediately.
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              The course is live. Invite mentees when you are ready.
            </p>
          )}
          <details className="mt-3">
            <summary className="w-fit cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
              Unpublish course…
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
                  I understand enrolled mentees will temporarily lose access.
                </label>
              ) : null}
              <Button type="submit" variant="destructive" size="sm">
                Unpublish
              </Button>
            </form>
          </details>
        </div>
      )}

      {publishError ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {publishError}
        </p>
      ) : null}
    </header>
  );
}
