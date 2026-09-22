import { BookOpen } from "lucide-react";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/auth/guards";
import { bypassProgressGatingForEmail } from "@/server/dev/seed-access";
import { loadEnrollmentSyllabus } from "@/server/progress/enrollment-syllabus";
import { SyllabusChapterRow } from "@/components/learn/syllabus-chapter-row";
import { formatStudyHours } from "@/lib/format-study-duration";

export default async function MenteeProgressPage() {
  const user = await requireUser();
  const bypassLocking = bypassProgressGatingForEmail(user.email ?? "");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: true },
    orderBy: { createdAt: "asc" },
  });

  const enrollmentIds = enrollments.map((e) => e.id);
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 6);
  since.setUTCHours(0, 0, 0, 0);

  const [dailyRows, timeByEnrollment] = await Promise.all([
    prisma.dailyActivity.findMany({
      where: { enrollmentId: { in: enrollmentIds }, date: { gte: since } },
      select: { enrollmentId: true, date: true, activeSeconds: true },
    }),
    prisma.chapterProgress.groupBy({
      by: ["enrollmentId"],
      where: { enrollmentId: { in: enrollmentIds } },
      _sum: { timeSpentSeconds: true },
    }),
  ]);

  const totalSecondsMap = new Map(
    timeByEnrollment.map((row) => [row.enrollmentId, row._sum.timeSpentSeconds ?? 0])
  );

  const courseProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const syllabus = await loadEnrollmentSyllabus({
        courseId: enrollment.courseId,
        enrollmentId: enrollment.id,
        bypassLocking,
      });
      const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(since);
        d.setUTCDate(since.getUTCDate() + i);
        return d.toISOString().slice(0, 10);
      });
      const secondsByDay = new Map<string, number>();
      for (const row of dailyRows.filter((r) => r.enrollmentId === enrollment.id)) {
        const key = row.date.toISOString().slice(0, 10);
        secondsByDay.set(key, (secondsByDay.get(key) ?? 0) + row.activeSeconds);
      }
      const weekActivity = weekDays.map((day) => ({
        day,
        seconds: secondsByDay.get(day) ?? 0,
      }));
      const maxWeekSeconds = Math.max(1, ...weekActivity.map((d) => d.seconds));
      return {
        enrollment,
        modules: syllabus?.modules ?? [],
        totalStudySeconds: totalSecondsMap.get(enrollment.id) ?? 0,
        weekActivity,
        maxWeekSeconds,
      };
    })
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">My progress</h1>
      <p className="mt-1 text-sm text-neutral-500">
        How you&apos;re doing across each assigned course.
      </p>

      {enrollments.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <BookOpen className="size-8 text-neutral-300" aria-hidden />
          <p className="mt-3 text-sm font-medium text-neutral-700">No courses yet</p>
          <p className="mt-1 text-sm text-neutral-400">
            Ask your mentor to assign you a course.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {courseProgress.map(({ enrollment, modules, totalStudySeconds, weekActivity, maxWeekSeconds }) => {
            const { course, percentComplete, chaptersCompleted, lastActiveAt } = enrollment;
            const totalChapters = modules.reduce((sum, mod) => sum + mod.chapters.length, 0);

            return (
              <section
                key={course.id}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
              >
                <div className="border-b border-neutral-100 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="min-w-0 truncate font-semibold text-neutral-900">
                      {course.title}
                    </p>
                    <span className="shrink-0 text-sm font-medium text-neutral-700">
                      {percentComplete}%
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-neutral-900"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>

                  <p className="mt-3 text-sm text-neutral-500">
                    {chaptersCompleted}/{totalChapters} chapters completed
                    <span className="text-neutral-300"> · </span>
                    {formatStudyHours(totalStudySeconds)} logged
                    <span className="text-neutral-300"> · </span>
                    {lastActiveAt
                      ? `Last active ${lastActiveAt.toLocaleDateString()}`
                      : "No activity yet"}
                  </p>
                  <div className="mt-4 flex items-end gap-1" aria-label="Study time last 7 days">
                    {weekActivity.map(({ day, seconds }) => (
                      <div key={day} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full min-h-[4px] rounded-sm bg-neutral-900/80"
                          style={{
                            height: `${Math.max(4, Math.round((seconds / maxWeekSeconds) * 48))}px`,
                          }}
                          title={`${day}: ${Math.round(seconds / 60)} min`}
                        />
                        <span className="text-[10px] text-neutral-400">
                          {new Date(`${day}T12:00:00Z`).toLocaleDateString(undefined, {
                            weekday: "narrow",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {modules.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-neutral-400">No chapters in this course.</p>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {modules.map((mod) => (
                      <div key={mod.id}>
                        <p className="bg-neutral-50/80 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          {String(mod.order).padStart(2, "0")} · {mod.title}
                        </p>
                        <ul className="divide-y divide-neutral-50">
                          {mod.chapters.map((chapter) => (
                            <li key={chapter.id}>
                              <SyllabusChapterRow
                                courseSlug={course.slug}
                                chapter={chapter}
                                variant="syllabus"
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
