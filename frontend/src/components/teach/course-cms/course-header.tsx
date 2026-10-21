import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Settings2,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { cn } from "@/lib/utils";
import { formatPriceDisplay } from "@/shared/lib/course-publish-rules";
import { publishCourse } from "@/server/actions/courses";
import type { CourseBuilderCourse } from "@/shared/api/teach";

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
    <header className="space-y-5 border-b pb-6">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All courses
      </Link>

      <div className="min-w-0 space-y-3">
        <h1 className="max-w-5xl text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          {course.title}
        </h1>
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
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {course.status === "PUBLISHED" && course.enrollmentCount > 0 ? (
            <p className="flex items-start gap-1.5 text-xs leading-5 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Publishing updates makes them visible to {course.enrollmentCount} enrolled learner{course.enrollmentCount === 1 ? "" : "s"}.
            </p>
          ) : course.status === "ARCHIVED" ? (
            <p className="text-xs text-muted-foreground">Archived courses are closed to new enrollments. Existing learners keep access.</p>
          ) : course.status === "DRAFT" ? (
            <p className="text-xs text-muted-foreground">Publish when ready to list the course in the catalog.</p>
          ) : null}
        </div>
        <nav aria-label="Course tools" className="flex flex-wrap items-center gap-2 sm:justify-end">
          <form
            action={async () => {
              "use server";
              const result = await publishCourse({ courseId: course.id });
              if (!result.ok) {
                redirect(`/courses/${course.slug}/edit?publishError=${encodeURIComponent(result.errors.join(" "))}`);
              }
            }}
          >
            <PendingSubmitButton size="lg" pendingLabel="Publishing…" className="gap-2">
              <Upload className="size-4" aria-hidden />
              {course.status === "PUBLISHED" ? "Publish updates" : course.status === "ARCHIVED" ? "Publish again" : "Publish course"}
            </PendingSubmitButton>
          </form>
          <Link
            href={`/courses/${course.slug}/preview`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Preview draft
          </Link>
          <Link
            href={`/courses/${course.slug}/settings`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            <Settings2 /> Settings
          </Link>
        </nav>
      </div>

      {publishError ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {publishError}
        </p>
      ) : null}
    </header>
  );
}
