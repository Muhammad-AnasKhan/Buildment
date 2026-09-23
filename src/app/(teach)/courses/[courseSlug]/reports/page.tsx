import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  CircleCheckBig,
  Download,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/server/db";
import { nowMs } from "@/server/time";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { cn } from "@/lib/utils";
import { formatStudyHours } from "@/lib/format-study-duration";
import { AutoSubmitSelect } from "@/components/teach/auto-submit-select";
import { CourseInsightsTabs } from "@/components/teach/course-insights-tabs";
import { buttonVariants } from "@/components/ui/button";

const AT_RISK_DAYS = 7;

export default async function CourseReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ chapterId?: string }>;
}) {
  const { courseSlug } = await params;
  const { chapterId } = await searchParams;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          chapters: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, estimatedMinutes: true },
          },
        },
      },
    },
  });
  if (!course) notFound();
  await requireMentorOfCourse(course.id);

  const chapters = course.modules.flatMap((mod) => mod.chapters);

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: course.id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const chapterProgress = await prisma.chapterProgress.findMany({
    where: { enrollment: { courseId: course.id } },
    include: {
      enrollment: { select: { user: { select: { name: true, email: true } } } },
    },
  });

  const studySecondsByEnrollment = new Map<string, number>();
  for (const progress of chapterProgress) {
    studySecondsByEnrollment.set(
      progress.enrollmentId,
      (studySecondsByEnrollment.get(progress.enrollmentId) ?? 0) + progress.timeSpentSeconds
    );
  }

  // Cohort funnel (Enrollment rollups only — docs/06-reports.mdx)
  const enrolled = enrollments.length;
  const started = enrollments.filter((e) => e.startedAt !== null).length;
  const completed = enrollments.filter((e) => e.status === "COMPLETED").length;

  // At-risk (v1): active but silent for 7+ days, or >3 chapters behind median
  const now = nowMs();
  const sortedCompleted = enrollments
    .filter((e) => e.status !== "DROPPED")
    .map((e) => e.chaptersCompleted)
    .sort((a, b) => a - b);
  const medianCompleted =
    sortedCompleted.length > 0
      ? sortedCompleted[Math.floor(sortedCompleted.length / 2)] ?? 0
      : 0;

  const atRisk = enrollments.filter((e) => {
    if (e.status === "COMPLETED" || e.status === "DROPPED") return false;
    const silent =
      e.status === "IN_PROGRESS" &&
      e.lastActiveAt !== null &&
      now - e.lastActiveAt.getTime() > AT_RISK_DAYS * 24 * 60 * 60 * 1000;
    const behind = e.status === "IN_PROGRESS" && e.chaptersCompleted < medianCompleted - 3;
    return silent || behind;
  });

  const selectedChapter = chapters.find((chapter) => chapter.id === chapterId);
  const averageCompletion =
    enrolled === 0
      ? 0
      : Math.round(enrollments.reduce((sum, item) => sum + item.percentComplete, 0) / enrolled);

  return (
    <div className="space-y-7 pb-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {course.title} · Insights
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Reports</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            See cohort progress, identify where learners stall, and decide what needs attention.
          </p>
        </div>
        {enrolled > 0 ? (
          <Link
            href={`/courses/${course.slug}/reports/export`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
          >
            <Download className="size-4" /> Export CSV
          </Link>
        ) : null}
      </header>

      <CourseInsightsTabs courseSlug={course.slug} active="reports" />

      {enrolled === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/50 px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-2xl border bg-background">
            <BarChart3 className="size-5 text-muted-foreground" />
          </span>
          <h2 className="mt-4 text-base font-semibold">No learner data yet</h2>
          <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
            Invite learners to this course. Their progress and chapter signals will appear here.
          </p>
          <Link
            href={`/courses/${course.slug}/mentees`}
            className={cn(buttonVariants({ size: "lg" }), "mt-5")}
          >
            Invite learners
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard icon={Users} label="Learners" value={enrolled} sub="Enrolled in this course" />
            <SummaryCard icon={TrendingUp} label="Started" value={`${pct(started, enrolled)}%`} sub={`${started} of ${enrolled} learners`} />
            <SummaryCard icon={BarChart3} label="Average progress" value={`${averageCompletion}%`} sub="Across the cohort" />
            <SummaryCard icon={CircleCheckBig} label="Completed" value={completed} sub={`${pct(completed, enrolled)}% completion rate`} />
          </div>

          {atRisk.length > 0 && (
            <section className="rounded-2xl border border-amber-300/60 bg-amber-50/70 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-950 dark:text-amber-200">
                <AlertTriangle className="size-4" />
                {atRisk.length} learner{atRisk.length === 1 ? "" : "s"} need attention
              </p>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                Inactive for {AT_RISK_DAYS}+ days or more than 3 chapters behind the cohort median.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {atRisk.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-lg border border-amber-200 bg-background px-2.5 py-1.5 text-xs font-medium text-amber-900 dark:border-amber-500/30 dark:text-amber-200"
                  >
                    <Link href={`/courses/${course.slug}/mentees/${e.id}`} className="hover:underline">
                      {e.user.name ?? e.user.email}
                      {e.lastActiveAt
                        ? ` · ${relativeLastActive(now - e.lastActiveAt.getTime())}`
                        : ""}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="border-b px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold">Learner progress</h2>
              <p className="mt-1 text-sm text-muted-foreground">A cohort-level view without ranking learners against one another.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] table-fixed text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-xs font-medium text-muted-foreground">
                    <th className="w-[24%] px-3 py-3">Learner</th>
                    <th className="w-[17%] px-3 py-3">Progress</th>
                    <th className="w-[9%] px-3 py-3">Score</th>
                    <th className="w-[13%] px-3 py-3">Study time</th>
                    <th className="w-[10%] px-3 py-3">Reviews</th>
                    <th className="w-[13%] px-3 py-3">Last active</th>
                    <th className="w-[14%] px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {enrollments.map((e) => {
                    const isAtRisk = atRisk.some((risk) => risk.id === e.id);
                    return (
                      <tr key={e.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-3 py-3">
                          <p className="font-medium text-foreground">
                            <Link href={`/courses/${course.slug}/mentees/${e.id}`} className="hover:underline">
                              {e.user.name ?? "Unnamed"}
                            </Link>
                            {isAtRisk && (
                              <span className="ml-2 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                                at risk
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{e.user.email}</p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-foreground"
                                style={{ width: `${e.percentComplete}%` }}
                              />
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {e.percentComplete}%
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs tabular-nums text-muted-foreground">
                          {e.maxScore > 0 ? `${e.totalScore}/${e.maxScore}` : "—"}
                        </td>
                        <td className="px-3 py-3 text-xs tabular-nums text-muted-foreground">
                          {formatStudyHours(studySecondsByEnrollment.get(e.id) ?? 0)}
                        </td>
                        <td className="px-3 py-3">
                          {e.pendingReviews > 0 ? (
                            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                              {e.pendingReviews}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">0</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">
                          {e.lastActiveAt ? relativeLastActive(now - e.lastActiveAt.getTime()) : "Never"}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                              e.status === "COMPLETED"
                                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                                : e.status === "IN_PROGRESS"
                                  ? "bg-foreground/10 text-foreground"
                                  : "bg-muted text-muted-foreground"
                            )}
                          >
                            {e.status.toLowerCase().replaceAll("_", " ")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Chapter report</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Per-block attempts and correct rates — confusion flags mark blocks to rewrite.
                </p>
              </div>
              <form action={`/courses/${course.slug}/reports`} method="GET">
                <AutoSubmitSelect
                  name="chapterId"
                  defaultValue={chapterId ?? ""}
                  className="h-9 rounded-lg border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="" disabled>
                    Choose a chapter…
                  </option>
                  {course.modules.map((module) => (
                    <optgroup key={module.id} label={module.title}>
                      {module.chapters.map((chapter) => (
                        <option key={chapter.id} value={chapter.id}>
                          {chapter.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </AutoSubmitSelect>
              </form>
            </div>

            {selectedChapter ? (
              <ChapterReport courseId={course.id} chapterId={selectedChapter.id} />
            ) : (
              <p className="mt-5 rounded-xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                Choose a chapter to inspect its blocks, attempts, and learner outcomes.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

async function ChapterReport({ courseId, chapterId }: { courseId: string; chapterId: string }) {
  const [blocks, progressRows] = await Promise.all([
    prisma.block.findMany({
      where: { chapterId, archivedAt: null },
      orderBy: { order: "asc" },
      select: { id: true, type: true, points: true, tags: true, stats: true },
    }),
    prisma.chapterProgress.findMany({
      where: { chapterId, enrollment: { courseId } },
      include: { enrollment: { select: { user: { select: { name: true, email: true } } } } },
    }),
  ]);

  return (
    <div className="mt-4 space-y-5">
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-2.5">Block</th>
              <th className="px-4 py-2.5">Attempts</th>
              <th className="px-4 py-2.5">Correct rate</th>
              <th className="px-4 py-2.5">Pending reviews</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {blocks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-xs text-muted-foreground">
                  This chapter has no interactive blocks.
                </td>
              </tr>
            )}
            {blocks.map((block) => {
              const attempts = block.stats?.attempts ?? 0;
              const correctRate = attempts > 0 ? (block.stats?.correctCount ?? 0) / attempts : null;
              const isGraded = block.type === "QUIZ" || block.type === "PREDICT" || block.type === "CODE";
              const confused = isGraded && attempts >= 2 && correctRate !== null && correctRate < 0.5;
              return (
                <tr key={block.id}>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs text-muted-foreground">{block.id}</span>
                    <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {block.type.replaceAll("_", " ").toLowerCase()}
                    </span>
                    {confused && (
                      <span className="ml-2 rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                        confusion flag
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs tabular-nums text-muted-foreground">
                    {attempts || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-xs tabular-nums text-muted-foreground">
                    {isGraded && correctRate !== null ? `${Math.round(correctRate * 100)}%` : "n/a"}
                  </td>
                  <td className="px-4 py-2.5 text-xs tabular-nums text-muted-foreground">
                    {block.stats?.pendingReviews || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {progressRows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-2.5">Mentee</th>
                <th className="px-4 py-2.5">Blocks</th>
                <th className="px-4 py-2.5">Score</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {progressRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-2.5 text-xs font-medium text-foreground">
                    {row.enrollment.user.name ?? row.enrollment.user.email}
                  </td>
                  <td className="px-4 py-2.5 text-xs tabular-nums text-muted-foreground">
                    {row.blocksCompleted}/{row.blocksTotal}
                  </td>
                  <td className="px-4 py-2.5 text-xs tabular-nums text-muted-foreground">
                    {row.maxScore > 0 ? `${row.score}/${row.maxScore}` : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                        row.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                          : row.status === "IN_PROGRESS"
                            ? "bg-foreground/10 text-foreground"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {row.status.toLowerCase().replaceAll("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="size-4" /> {label}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function pct(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

function relativeLastActive(ms: number): string {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}
