import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { prisma } from "@/server/db";
import { requireLearnSurface } from "@/server/auth/guards";
import { bypassProgressGatingForEmail } from "@/server/dev/seed-access";
import { loadEnrollmentSyllabus, resolveContinueChapterPath } from "@/server/progress/enrollment-syllabus";
import { formatStudyHours } from "@/lib/format-study-duration";
import { closedWrongCheckpoints } from "@/server/progress/attention";
import { cn } from "@/lib/utils";

function percentage(score: number, maxScore: number) {
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : null;
}

function accuracyState(value: number | null) {
  if (value === null) return { label: "Not scored yet", detail: "Complete a scored quiz, prediction, test, or code check to establish accuracy.", className: "text-muted-foreground", icon: Target };
  if (value >= 80) return { label: "Strong understanding", detail: "Your scored checkpoints show reliable understanding.", className: "text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 };
  if (value >= 60) return { label: "Developing understanding", detail: "Review missed checkpoints before moving too far ahead.", className: "text-amber-700 dark:text-amber-400", icon: CircleAlert };
  return { label: "Needs review", detail: "Revisit the scored chapters below and try the checks again.", className: "text-destructive", icon: CircleAlert };
}

export default async function MenteeProgressPage() {
  const user = await requireLearnSurface();
  const bypassLocking = bypassProgressGatingForEmail(user.email ?? "");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id, status: { not: "DROPPED" } },
    orderBy: [{ lastActiveAt: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      courseId: true,
      percentComplete: true,
      chaptersCompleted: true,
      totalScore: true,
      maxScore: true,
      pendingReviews: true,
      lastActiveAt: true,
      course: { select: { id: true, slug: true, title: true } },
      chapterProgress: {
        select: {
          chapterId: true,
          status: true,
          score: true,
          maxScore: true,
          timeSpentSeconds: true,
        },
      },
    },
  });

  const enrollmentIds = enrollments.map((enrollment) => enrollment.id);
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 6);
  since.setUTCHours(0, 0, 0, 0);

  const missedResponses = enrollmentIds.length === 0
    ? []
    : await prisma.response.findMany({
        where: {
          userId: user.id,
          enrollmentId: { in: enrollmentIds },
          isCorrect: false,
          status: { not: "DRAFT" },
          block: { archivedAt: null, type: { in: ["QUIZ", "PREDICT", "CODE"] } },
        },
        orderBy: { attempt: "desc" },
        select: {
          blockId: true,
          attempt: true,
          isCorrect: true,
          block: {
            select: {
              type: true,
              config: true,
              chapter: { select: { slug: true, title: true, course: { select: { slug: true, title: true } } } },
            },
          },
        },
      });
  const closedWrong = closedWrongCheckpoints(missedResponses).slice(0, 12);

  const dailyRows = enrollmentIds.length > 0
    ? await prisma.dailyActivity.findMany({
        where: { enrollmentId: { in: enrollmentIds }, date: { gte: since } },
        select: { enrollmentId: true, date: true, activeSeconds: true },
      })
    : [];

  const courseProgress = await Promise.all(enrollments.map(async (enrollment) => {
    const syllabus = await loadEnrollmentSyllabus({
      courseId: enrollment.courseId,
      enrollmentId: enrollment.id,
      bypassLocking,
    });
    const continueHref = syllabus
      ? resolveContinueChapterPath(enrollment.course.slug, syllabus.flatChapters)
      : null;
    const progressByChapter = new Map(
      enrollment.chapterProgress.map((row) => [row.chapterId, row])
    );
    const modules = (syllabus?.modules ?? []).map((module) => {
      const rows = module.chapters.map((chapter) => progressByChapter.get(chapter.id));
      const score = rows.reduce((sum, row) => sum + (row?.score ?? 0), 0);
      const maxScore = rows.reduce((sum, row) => sum + (row?.maxScore ?? 0), 0);
      return {
        id: module.id,
        order: module.order,
        title: module.title,
        completed: rows.filter((row) => row?.status === "COMPLETED").length,
        total: module.chapters.length,
        score,
        maxScore,
      };
    });
    const week = dailyRows.filter((row) => row.enrollmentId === enrollment.id);
    const activeDays = new Set(
      week.filter((row) => row.activeSeconds > 0).map((row) => row.date.toISOString().slice(0, 10))
    ).size;
    const weekSeconds = week.reduce((sum, row) => sum + row.activeSeconds, 0);
    const totalStudySeconds = enrollment.chapterProgress.reduce((sum, row) => sum + row.timeSpentSeconds, 0);
    const totalChapters = modules.reduce((sum, module) => sum + module.total, 0);

    return { enrollment, modules, activeDays, weekSeconds, totalStudySeconds, totalChapters, continueHref };
  }));

  const overall = courseProgress.reduce(
    (summary, course) => ({
      chaptersCompleted: summary.chaptersCompleted + course.enrollment.chaptersCompleted,
      totalChapters: summary.totalChapters + course.totalChapters,
      score: summary.score + course.enrollment.totalScore,
      maxScore: summary.maxScore + course.enrollment.maxScore,
      weekSeconds: summary.weekSeconds + course.weekSeconds,
      pendingReviews: summary.pendingReviews + course.enrollment.pendingReviews,
    }),
    { chaptersCompleted: 0, totalChapters: 0, score: 0, maxScore: 0, weekSeconds: 0, pendingReviews: 0 }
  );
  const overallAccuracy = percentage(overall.score, overall.maxScore);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="border-b pb-6">
        <p className="text-sm font-medium text-muted-foreground">Learning evidence</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">My progress</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Completion shows what you finished. Scored accuracy shows how well you understood graded checkpoints.
        </p>
      </header>

      {courseProgress.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
          <BookOpen className="size-8 text-muted-foreground" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">No progress to show yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">Assigned courses will appear here with completion and correctness signals.</p>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>Back to dashboard</Link>
        </div>
      ) : (
        <>
          <section aria-label="Overall progress" className="mt-8 grid overflow-hidden rounded-2xl border bg-card sm:grid-cols-2 xl:grid-cols-4">
            <SummaryMetric label="Courses" value={String(courseProgress.length)} detail="Active assignments" />
            <SummaryMetric label="Chapters complete" value={`${overall.chaptersCompleted}/${overall.totalChapters}`} detail={`${percentage(overall.chaptersCompleted, overall.totalChapters) ?? 0}% of the curriculum`} />
            <SummaryMetric label="All courses accuracy" value={overallAccuracy === null ? "—" : `${overallAccuracy}%`} detail={overall.maxScore > 0 ? `${overall.score} of ${overall.maxScore} points across assigned courses` : "No scored checks yet"} />
            <SummaryMetric label="Estimated study this week" value={formatStudyHours(overall.weekSeconds)} detail={overall.pendingReviews > 0 ? `${overall.pendingReviews} awaiting review` : "Time is an estimate; course completion is based on your work."} />
          </section>

          {closedWrong.length > 0 ? (
            <section aria-labelledby="closed-wrong-heading" className="mt-8">
              <h2 id="closed-wrong-heading" className="text-lg font-semibold tracking-tight">Saved without a retry</h2>
              <p className="mt-1 text-sm text-muted-foreground">These checks counted on a wrong answer because retry was off.</p>
              <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border bg-card">
                {closedWrong.map((row) => (
                  <li key={row.blockId}>
                    <Link href={`/courses/${row.block.chapter.course.slug}/${row.block.chapter.slug}`} className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{row.block.chapter.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{row.block.chapter.course.title}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {row.block.type === "PREDICT" ? "Prediction" : row.block.type === "CODE" ? "Code" : "Quiz"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-8 space-y-6">
            {courseProgress.map(({ enrollment, modules, activeDays, weekSeconds, totalStudySeconds, totalChapters, continueHref }) => {
              const accuracy = percentage(enrollment.totalScore, enrollment.maxScore);
              const understanding = accuracyState(accuracy);
              const UnderstandingIcon = understanding.icon;
              const modulesWithEvidence = modules.filter(
                (module) => module.completed > 0 || module.maxScore > 0
              );
              const futureModuleCount = modules.length - modulesWithEvidence.length;
              return (
                <section key={enrollment.course.id} className="overflow-hidden rounded-2xl border bg-card">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold tracking-tight">{enrollment.course.title}</h2>
                          {enrollment.pendingReviews > 0 ? <Badge variant="secondary">{enrollment.pendingReviews} awaiting review</Badge> : null}
                        </div>
                        <div className={cn("mt-3 flex items-start gap-2", understanding.className)}>
                          <UnderstandingIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                          <div>
                            <p className="text-sm font-semibold">{understanding.label}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{understanding.detail}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-3">
                        {continueHref ? (
                          <Link href={continueHref} className={buttonVariants()}>
                            Continue <ArrowRight data-icon="inline-end" />
                          </Link>
                        ) : null}
                        <Link href={`/courses/${enrollment.course.slug}`} className="inline-flex items-center gap-1 text-sm font-medium hover:underline">
                          Course overview
                        </Link>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-5 border-y py-5 sm:grid-cols-2 lg:grid-cols-4">
                      <CourseMetric label="Completion" value={`${enrollment.percentComplete}%`} detail={`${enrollment.chaptersCompleted} of ${totalChapters} chapters`} />
                      <CourseMetric label="Scored accuracy" value={accuracy === null ? "—" : `${accuracy}%`} detail={enrollment.maxScore > 0 ? `${enrollment.totalScore}/${enrollment.maxScore} points` : "Not scored yet"} />
                      <CourseMetric label="Estimated study time" value={formatStudyHours(totalStudySeconds)} detail={`${formatStudyHours(weekSeconds)} this week`} />
                      <CourseMetric label="Consistency" value={`${activeDays}/7 days`} detail={enrollment.lastActiveAt ? `Last active ${enrollment.lastActiveAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : "Not started"} />
                    </div>

                    <div className="mt-5">
                      <Progress value={enrollment.percentComplete} className="gap-2">
                        <ProgressLabel className="text-xs text-muted-foreground">Course completion</ProgressLabel>
                        <span className="ml-auto text-xs tabular-nums text-muted-foreground">{enrollment.percentComplete}%</span>
                      </Progress>
                    </div>
                  </div>

                  <div className="border-t bg-muted/15">
                    <div className="flex items-center justify-between gap-4 px-5 py-3 sm:px-6">
                      <div>
                        <h3 className="text-sm font-semibold">Module understanding</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">Accuracy appears only where scored checkpoints exist.</p>
                      </div>
                      <span className="hidden text-xs text-muted-foreground sm:inline">Completion · accuracy</span>
                    </div>
                    <div className="divide-y border-t">
                      {modulesWithEvidence.map((module) => {
                        const moduleAccuracy = percentage(module.score, module.maxScore);
                        return (
                          <div key={module.id} className="grid gap-2 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-6 sm:px-6">
                            <p className="min-w-0 truncate text-sm font-medium">
                              <span className="mr-2 text-xs tabular-nums text-muted-foreground">{String(module.order).padStart(2, "0")}</span>
                              {module.title}
                            </p>
                            <span className="text-xs tabular-nums text-muted-foreground">{module.completed}/{module.total} complete</span>
                            <span className={cn("text-xs font-medium tabular-nums sm:w-24 sm:text-right", accuracyState(moduleAccuracy).className)}>
                              {moduleAccuracy === null ? "Not scored" : `${moduleAccuracy}% correct`}
                            </span>
                          </div>
                        );
                      })}
                      {futureModuleCount > 0 ? (
                        <div className="px-5 py-3.5 text-xs text-muted-foreground sm:px-6">
                          {futureModuleCount} upcoming module{futureModuleCount === 1 ? "" : "s"} hidden until learning evidence appears.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="border-b p-5 last:border-b-0 sm:[&:nth-child(even)]:border-l sm:[&:nth-child(n+3)]:border-b-0 xl:border-b-0 xl:border-l xl:first:border-l-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function CourseMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
