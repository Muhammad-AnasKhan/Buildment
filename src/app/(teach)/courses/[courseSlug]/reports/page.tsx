import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, BarChart3, Download } from "lucide-react";
import { prisma } from "@/server/db";
import { nowMs } from "@/server/time";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { cn } from "@/lib/utils";
import { formatStudyHours } from "@/lib/format-study-duration";

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

  const chapters = course.modules.flatMap((mod) =>
    mod.chapters.map((chapter) => ({ ...chapter, moduleTitle: mod.title }))
  );

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

  const courseEstimateMinutes = course.modules.reduce(
    (sum, mod) =>
      sum + mod.chapters.reduce((s, ch) => s + (ch.estimatedMinutes ?? 0), 0),
    0
  );
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

  // Chapter completion curve
  const completedByChapter = new Map<string, number>();
  const startedByChapter = new Map<string, number>();
  for (const progress of chapterProgress) {
    if (progress.status === "COMPLETED") {
      completedByChapter.set(progress.chapterId, (completedByChapter.get(progress.chapterId) ?? 0) + 1);
    }
    if (progress.status !== "NOT_STARTED") {
      startedByChapter.set(progress.chapterId, (startedByChapter.get(progress.chapterId) ?? 0) + 1);
    }
  }

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

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/courses/${course.slug}/edit`}
        className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
      >
        ← Back to course
      </Link>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Reports — {course.title}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Cohort progress, chapter completion, and which blocks are causing confusion.
          </p>
        </div>
        {enrolled > 0 ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/courses/${course.slug}/activity`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Daily activity
            </Link>
            <Link
              href={`/courses/${course.slug}/reports/export`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <Download className="size-3.5" />
              Export CSV
            </Link>
          </div>
        ) : null}
      </div>

      {enrolled === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-2 text-center">
          <BarChart3 className="size-8 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-700">No mentees enrolled yet</p>
          <p className="text-sm text-neutral-400">
            Assign the course to see cohort reports here.
          </p>
        </div>
      ) : (
        <>
          {/* Funnel */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <FunnelCard label="Enrolled" value={enrolled} />
            <FunnelCard label="Started" value={started} sub={`${pct(started, enrolled)}% of enrolled`} />
            <FunnelCard label="Completed" value={completed} sub={`${pct(completed, enrolled)}% of enrolled`} />
          </div>

          {atRisk.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-800">
                <AlertTriangle className="size-4" />
                {atRisk.length} mentee{atRisk.length === 1 ? "" : "s"} at risk
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Inactive for {AT_RISK_DAYS}+ days or more than 3 chapters behind the cohort median.
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {atRisk.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-amber-800"
                  >
                    {e.user.name ?? e.user.email}
                    {e.lastActiveAt
                      ? ` · last active ${relativeDays(now - e.lastActiveAt.getTime())} ago`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Chapter completion curve */}
          <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-neutral-900">Chapter completion</h2>
            <p className="mt-0.5 text-xs text-neutral-400">
              How many mentees finished each chapter — a drop between consecutive bars is where
              the cohort stalls.
            </p>
            <div className="mt-4 space-y-1">
              {chapters.map((chapter) => {
                const done = completedByChapter.get(chapter.id) ?? 0;
                const active = startedByChapter.get(chapter.id) ?? 0;
                return (
                  <Link
                    key={chapter.id}
                    href={`/courses/${course.slug}/reports?chapterId=${chapter.id}`}
                    className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-50 sm:grid-cols-[minmax(0,340px)_1fr_auto]"
                  >
                    <span className="truncate text-sm text-neutral-700 transition-colors group-hover:text-neutral-900">
                      {chapter.title}
                    </span>
                    <span className="hidden h-2 overflow-hidden rounded-full bg-neutral-100 sm:block">
                      <span className="flex h-full">
                        <span
                          className="h-full bg-emerald-500"
                          style={{ width: `${pct(done, enrolled)}%` }}
                        />
                        <span
                          className="h-full bg-indigo-200"
                          style={{ width: `${pct(Math.max(0, active - done), enrolled)}%` }}
                        />
                      </span>
                    </span>
                    <span className="text-xs tabular-nums text-neutral-400">
                      {done}/{enrolled}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Mentee table */}
          <section className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-xs font-medium text-neutral-500">
                    <th className="px-4 py-3">Mentee</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Study time</th>
                    <th className="px-4 py-3">Awaiting review</th>
                    <th className="px-4 py-3">Last active</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {enrollments.map((e) => {
                    const isAtRisk = atRisk.some((risk) => risk.id === e.id);
                    return (
                      <tr key={e.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-neutral-900">
                            {e.user.name ?? "Unnamed"}
                            {isAtRisk && (
                              <span className="ml-2 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                at risk
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-neutral-400">{e.user.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-neutral-100">
                              <div
                                className="h-full rounded-full bg-indigo-600"
                                style={{ width: `${e.percentComplete}%` }}
                              />
                            </div>
                            <span className="text-xs tabular-nums text-neutral-500">
                              {e.percentComplete}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs tabular-nums text-neutral-600">
                          {e.maxScore > 0 ? `${e.totalScore}/${e.maxScore}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs tabular-nums text-neutral-600">
                          {formatStudyHours(studySecondsByEnrollment.get(e.id) ?? 0)}
                          {courseEstimateMinutes > 0 && (
                            <span className="text-neutral-400">
                              {" "}
                              / ~
                              {Math.round(courseEstimateMinutes / 60)}h goal
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {e.pendingReviews > 0 ? (
                            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                              {e.pendingReviews}
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-300">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-500">
                          {e.lastActiveAt ? relativeDays(now - e.lastActiveAt.getTime()) + " ago" : "never"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-xs font-medium",
                              e.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700"
                                : e.status === "IN_PROGRESS"
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "bg-neutral-100 text-neutral-500"
                            )}
                          >
                            {e.status.toLowerCase().replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Chapter drill-down */}
          <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Chapter report</h2>
                <p className="mt-0.5 text-xs text-neutral-400">
                  Per-block attempts and correct rates — confusion flags mark blocks to rewrite.
                </p>
              </div>
              <form action={`/courses/${course.slug}/reports`} method="GET">
                <select
                  name="chapterId"
                  defaultValue={chapterId ?? ""}
                  onChange={(event) => event.target.form?.requestSubmit()}
                  className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-indigo-300"
                >
                  <option value="" disabled>
                    Choose a chapter…
                  </option>
                  {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.title}
                    </option>
                  ))}
                </select>
              </form>
            </div>

            {selectedChapter ? (
              <ChapterReport courseId={course.id} chapterId={selectedChapter.id} />
            ) : (
              <p className="mt-4 rounded-lg border border-neutral-200 p-6 text-center text-xs text-neutral-400">
                Select a chapter above to see its block-by-block report.
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
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs font-medium text-neutral-500">
              <th className="px-4 py-2.5">Block</th>
              <th className="px-4 py-2.5">Attempts</th>
              <th className="px-4 py-2.5">Correct rate</th>
              <th className="px-4 py-2.5">Pending reviews</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {blocks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-xs text-neutral-400">
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
                    <span className="font-mono text-xs text-neutral-500">{block.id}</span>
                    <span className="ml-2 rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                      {block.type.replaceAll("_", " ").toLowerCase()}
                    </span>
                    {confused && (
                      <span className="ml-2 rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                        confusion flag
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs tabular-nums text-neutral-600">
                    {attempts || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-xs tabular-nums text-neutral-600">
                    {isGraded && correctRate !== null ? `${Math.round(correctRate * 100)}%` : "n/a"}
                  </td>
                  <td className="px-4 py-2.5 text-xs tabular-nums text-neutral-600">
                    {block.stats?.pendingReviews || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {progressRows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs font-medium text-neutral-500">
                <th className="px-4 py-2.5">Mentee</th>
                <th className="px-4 py-2.5">Blocks</th>
                <th className="px-4 py-2.5">Score</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {progressRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-2.5 text-xs font-medium text-neutral-800">
                    {row.enrollment.user.name ?? row.enrollment.user.email}
                  </td>
                  <td className="px-4 py-2.5 text-xs tabular-nums text-neutral-600">
                    {row.blocksCompleted}/{row.blocksTotal}
                  </td>
                  <td className="px-4 py-2.5 text-xs tabular-nums text-neutral-600">
                    {row.maxScore > 0 ? `${row.score}/${row.maxScore}` : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        row.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700"
                          : row.status === "IN_PROGRESS"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-neutral-100 text-neutral-500"
                      )}
                    >
                      {row.status.toLowerCase().replace("_", " ")}
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

function FunnelCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-neutral-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-neutral-400">{sub}</p>}
    </div>
  );
}

function pct(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

function relativeDays(ms: number): string {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "1 day";
  return `${days} days`;
}
