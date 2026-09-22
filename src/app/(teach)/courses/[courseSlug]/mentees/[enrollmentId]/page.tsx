import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { formatStudyAmount, formatStudyClock } from "@/lib/format-study-duration";
import { loadStudyWeek } from "@/server/progress/study-summary";
import { submissionPreview } from "@/server/progress/submission-preview";

function activityLabel(lastActiveAt: Date | null, live: boolean) {
  if (live) return "Active now";
  if (!lastActiveAt) return "Not started";
  const minutes = Math.round((Date.now() - lastActiveAt.getTime()) / 60000);
  if (minutes < 2) return "Active just now";
  if (minutes < 60) return `Last active ${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 36) return `Last active ${hours} h ago`;
  return `Last active ${lastActiveAt.toLocaleString()}`;
}

export default async function MenteeProfilePage({
  params,
}: {
  params: Promise<{ courseSlug: string; enrollmentId: string }>;
}) {
  const { courseSlug, enrollmentId } = await params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: { id: true, slug: true, title: true },
  });
  if (!course) notFound();
  await requireMentorOfCourse(course.id);

  const enrollment = await prisma.enrollment.findFirst({
    where: { id: enrollmentId, courseId: course.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!enrollment) notFound();

  const [running, chapterRows, openHelp, waiting, sessions, study, timeSum, chapterCount] =
    await Promise.all([
      prisma.studySession.findFirst({
        where: { enrollmentId: enrollment.id, status: "RUNNING" },
        orderBy: { updatedAt: "desc" },
        include: {
          chapter: {
            select: {
              title: true,
              slug: true,
              estimatedMinutes: true,
              module: { select: { title: true, order: true } },
            },
          },
        },
      }),
      prisma.chapterProgress.findMany({
        where: { enrollmentId: enrollment.id, status: { not: "NOT_STARTED" } },
        orderBy: [{ startedAt: "desc" }],
        take: 8,
        include: {
          chapter: {
            select: {
              title: true,
              slug: true,
              estimatedMinutes: true,
              module: { select: { title: true, order: true } },
            },
          },
        },
      }),
      prisma.helpThread.findMany({
        where: { courseId: course.id, menteeId: enrollment.userId, status: "OPEN" },
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          chapter: { select: { title: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true } },
        },
      }),
      prisma.response.findMany({
        where: { enrollmentId: enrollment.id, status: { not: "DRAFT" } },
        orderBy: { submittedAt: "desc" },
        take: 80,
        include: {
          review: { select: { verdict: true, feedback: true } },
          block: {
            select: {
              id: true,
              type: true,
              config: true,
              chapter: { select: { title: true } },
            },
          },
        },
      }),
      prisma.studySession.findMany({
        where: { enrollmentId: enrollment.id },
        orderBy: { startedAt: "desc" },
        take: 8,
        include: { chapter: { select: { title: true } } },
      }),
      loadStudyWeek([enrollment.id]),
      prisma.chapterProgress.aggregate({
        where: { enrollmentId: enrollment.id },
        _sum: { timeSpentSeconds: true },
      }),
      prisma.chapter.count({ where: { courseId: course.id } }),
    ]);

  const currentProgress = running
    ? (chapterRows.find((row) => row.chapterId === running.chapterId) ?? null)
    : (chapterRows.find((row) => row.status === "IN_PROGRESS") ?? chapterRows[0] ?? null);

  const currentChapter = running?.chapter ?? currentProgress?.chapter ?? null;
  const live =
    Boolean(running) &&
    enrollment.lastActiveAt != null &&
    Date.now() - enrollment.lastActiveAt.getTime() < 3 * 60 * 1000;
  const totalSeconds = timeSum._sum.timeSpentSeconds ?? 0;
  const name = enrollment.user.name ?? enrollment.user.email ?? "Mentee";
  const seenBlocks = new Set<string>();
  const submissions = waiting.flatMap((response) => {
    if (seenBlocks.has(response.block.id)) return [];
    seenBlocks.add(response.block.id);
    const preview = submissionPreview(response.block.type, response.block.config, response.payload);
    return [
      {
        id: response.id,
        type: response.block.type,
        chapterTitle: response.block.chapter.title,
        status: response.status,
        isCorrect: response.isCorrect,
        attempt: response.attempt,
        submittedAt: response.submittedAt,
        prompt: preview.prompt,
        answer: preview.answer,
        feedback: response.review?.feedback?.trim() || null,
        reviewHref: response.block.type === "OPEN_QUESTION" ? `/review/${response.id}` : null,
      },
    ];
  });
  const pendingSubmissions = submissions.filter((item) => item.status === "PENDING_REVIEW");
  const otherSubmissions = submissions.filter((item) => item.status !== "PENDING_REVIEW");

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/courses/${course.slug}/mentees`}
        className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
      >
        ← All mentees
      </Link>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{name}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {enrollment.user.email} · {course.title}
          </p>
        </div>
        <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
          {enrollment.status.toLowerCase().replace("_", " ")}
        </span>
      </div>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Right now</p>
        <p className="mt-2 text-lg font-semibold text-neutral-900">
          {live ? "Studying" : currentChapter ? "Last worked on" : "Has not started a chapter"}
        </p>
        {currentChapter ? (
          <p className="mt-1 text-sm text-neutral-700">
            {currentChapter.module
              ? `Module ${String(currentChapter.module.order).padStart(2, "0")} · ${currentChapter.module.title} — `
              : ""}
            {currentChapter.title}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-neutral-500">
          {activityLabel(enrollment.lastActiveAt, live)}
          {running ? ` · this session ${formatStudyClock(running.activeSeconds)}` : ""}
        </p>
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-4">
        <Stat label="Course" value={`${enrollment.percentComplete}%`} />
        <Stat label="Chapters" value={`${enrollment.chaptersCompleted}/${chapterCount}`} />
        <Stat label="This week" value={formatStudyAmount(study.weekSeconds)} />
        <Stat label="All time" value={formatStudyAmount(totalSeconds)} />
      </section>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-neutral-900"
          style={{ width: `${enrollment.percentComplete}%` }}
        />
      </div>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">What they’re working on</h2>
        {currentChapter ? (
          <div className="mt-3 text-sm text-neutral-700">
            <p className="font-medium text-neutral-900">{currentChapter.title}</p>
            <p className="mt-1 text-neutral-500">
              {currentProgress
                ? `${currentProgress.status.toLowerCase().replace("_", " ")} · ${formatStudyAmount(currentProgress.timeSpentSeconds)} on this chapter`
                : "Session in progress"}
              {currentChapter.estimatedMinutes ? ` · goal ~${currentChapter.estimatedMinutes}m` : ""}
              {currentProgress
                ? ` · ${currentProgress.blocksCompleted}/${currentProgress.blocksTotal} checkpoints`
                : ""}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">No chapter opened yet.</p>
        )}
        {chapterRows.length > 0 && (
          <ul className="mt-4 divide-y divide-neutral-100">
            {chapterRows.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0 truncate text-neutral-800">{row.chapter.title}</span>
                <span className="shrink-0 text-xs text-neutral-500">
                  {row.status === "COMPLETED" ? "Done" : "In progress"} ·{" "}
                  {formatStudyAmount(row.timeSpentSeconds)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-neutral-900">
          Submissions · {submissions.length}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Latest answer on each question. Open questions can be reviewed in full.
        </p>
        {submissions.length === 0 ? (
          <p className="mt-3 rounded-xl border border-neutral-200 bg-white px-5 py-8 text-sm text-neutral-500">
            No answers submitted yet.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {[...pendingSubmissions, ...otherSubmissions].map((item) => (
              <article key={item.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-500">
                      {item.chapterTitle} · {labelForBlockType(item.type)} · attempt {item.attempt}
                    </p>
                    {item.prompt ? (
                      <p className="mt-1 text-sm font-medium text-neutral-900">{item.prompt}</p>
                    ) : null}
                  </div>
                  <SubmissionStatus status={item.status} isCorrect={item.isCorrect} />
                </div>
                <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-neutral-50 px-3 py-2 font-sans text-sm leading-relaxed text-neutral-800">
                  {item.answer}
                </pre>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-neutral-400">{item.submittedAt.toLocaleString()}</p>
                  {item.reviewHref ? (
                    <Link
                      href={item.reviewHref}
                      className="inline-flex h-9 items-center rounded-lg border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
                    >
                      {item.status === "PENDING_REVIEW" ? "Review submission" : "Open submission"}
                    </Link>
                  ) : null}
                </div>
                {item.feedback ? (
                  <p className="mt-3 border-t border-neutral-100 pt-3 text-sm text-neutral-600">
                    Feedback: {item.feedback}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>

      {openHelp.length > 0 && (
        <section className="mt-4 rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Open help requests</h2>
          <ul className="mt-3 space-y-2">
            {openHelp.map((thread) => (
              <li key={thread.id}>
                <Link
                  href={`/help/${thread.id}`}
                  className="text-sm font-medium text-neutral-900 underline-offset-2 hover:underline"
                >
                  {thread.chapter ? thread.chapter.title : "Help request"}
                </Link>
                {thread.messages[0] ? (
                  <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">{thread.messages[0].body}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-4 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Recent study sessions</h2>
        {sessions.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">
            No sessions yet. Time appears here after they press Start on a chapter.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100">
            {sessions.map((session) => (
              <li key={session.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0 truncate text-neutral-800">{session.chapter.title}</span>
                <span className="shrink-0 text-xs text-neutral-500">
                  {formatStudyClock(session.activeSeconds)} · {session.status.toLowerCase()} ·{" "}
                  {session.startedAt.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function labelForBlockType(type: string) {
  return type.toLowerCase().replace(/_/g, " ");
}

function SubmissionStatus({
  status,
  isCorrect,
}: {
  status: string;
  isCorrect: boolean | null;
}) {
  const label =
    status === "AUTO_GRADED"
      ? isCorrect === true
        ? "Correct"
        : isCorrect === false
          ? "Incorrect"
          : "Graded"
      : status === "PENDING_REVIEW"
        ? "Needs review"
        : status === "NEEDS_REVISION"
          ? "Needs revision"
          : status === "REVIEWED"
            ? "Reviewed"
            : "Submitted";
  const tone =
    label === "Correct" || label === "Reviewed"
      ? "bg-emerald-50 text-emerald-700"
      : label === "Incorrect"
        ? "bg-red-50 text-red-700"
        : label === "Needs review" || label === "Needs revision"
          ? "bg-amber-50 text-amber-800"
          : "bg-neutral-100 text-neutral-700";

  return (
    <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${tone}`}>{label}</span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-neutral-900">{value}</p>
    </div>
  );
}
