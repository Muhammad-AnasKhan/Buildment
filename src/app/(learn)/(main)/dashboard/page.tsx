import Link from "next/link";
import { BookOpen } from "lucide-react";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/auth/guards";
import type { EnrollStatus } from "@/generated/prisma/client";
import { bypassProgressGatingForEmail } from "@/server/dev/seed-access";
import { formatStudyAmount } from "@/lib/format-study-duration";
import {
  loadEnrollmentSyllabus,
  resolveContinueChapterPath,
} from "@/server/progress/enrollment-syllabus";
import { loadStudyWeek } from "@/server/progress/study-summary";

const STATUS_BADGE: Record<EnrollStatus, { label: string; className: string }> = {
  ASSIGNED: { label: "Assigned", className: "bg-neutral-100 text-neutral-600" },
  IN_PROGRESS: { label: "In progress", className: "bg-neutral-100 text-neutral-700" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
  DROPPED: { label: "Dropped", className: "bg-neutral-100 text-neutral-600" },
};

export default async function MenteeDashboardPage() {
  const user = await requireUser();
  const bypassLocking = bypassProgressGatingForEmail(user.email ?? "");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: true },
    orderBy: { createdAt: "asc" },
  });

  const study = await loadStudyWeek(enrollments.map((enrollment) => enrollment.id));

  const cards = await Promise.all(
    enrollments.map(async (enrollment) => {
      const { course, percentComplete, status, id: enrollmentId } = enrollment;
      const syllabus = await loadEnrollmentSyllabus({
        courseId: course.id,
        enrollmentId,
        bypassLocking,
      });
      const href =
        resolveContinueChapterPath(course.slug, syllabus?.flatChapters ?? []) ??
        `/courses/${course.slug}`;
      return { course, percentComplete, status, href };
    })
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">My learning</h1>
      <p className="mt-1 text-sm text-neutral-500">Courses assigned to you by your mentor.</p>

      {enrollments.length > 0 && (
        <section className="mt-8 rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Study time</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Press Start on a chapter to log time. Pause holds the clock. Leaving the chapter saves the session and stops it.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-neutral-50 px-3 py-3">
              <p className="text-xs text-neutral-500">Today</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-neutral-900">
                {formatStudyAmount(study.todaySeconds)}
              </p>
            </div>
            <div className="rounded-lg bg-neutral-50 px-3 py-3">
              <p className="text-xs text-neutral-500">This week</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-neutral-900">
                {formatStudyAmount(study.weekSeconds)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-end gap-1" aria-label="Study time last 7 days">
            {study.week.map(({ day, seconds }) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full min-h-[4px] rounded-sm bg-neutral-900/80"
                  style={{
                    height: `${Math.max(4, Math.round((seconds / study.maxDaySeconds) * 48))}px`,
                  }}
                  title={`${day}: ${Math.round(seconds / 60)} min`}
                />
                <span className="text-[10px] text-neutral-400">
                  {new Date(`${day}T12:00:00Z`).toLocaleDateString(undefined, { weekday: "narrow" })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {enrollments.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <BookOpen className="size-8 text-neutral-300" aria-hidden />
          <p className="mt-3 text-sm font-medium text-neutral-700">No courses yet</p>
          <p className="mt-1 text-sm text-neutral-400">
            Ask your mentor to assign you a course.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {cards.map(({ course, percentComplete, status, href }) => {
            const badge = STATUS_BADGE[status] ?? STATUS_BADGE.ASSIGNED;
            const action =
              percentComplete >= 100
                ? "Review →"
                : percentComplete === 0
                  ? "Start →"
                  : "Continue →";

            return (
              <Link
                key={course.id}
                href={href}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition-colors hover:border-neutral-300"
              >
                <div className="aspect-[16/6] w-full overflow-hidden">
                  {course.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                      <span className="text-4xl font-semibold text-neutral-400" aria-hidden>
                        {course.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                  <p className="mt-2 font-semibold text-neutral-900 line-clamp-1">
                    {course.title}
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-neutral-900"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-neutral-500">
                      {percentComplete}% complete
                    </span>
                    <span className="text-sm font-medium text-neutral-800">{action}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
