import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { formatStudyHours } from "@/lib/format-study-duration";

export default async function CourseActivityPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: { id: true, slug: true, title: true },
  });
  if (!course) notFound();
  await requireMentorOfCourse(course.id);

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 13);
  since.setUTCHours(0, 0, 0, 0);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const [enrollments, activityRows] = await Promise.all([
    prisma.enrollment.findMany({
      where: { courseId: course.id },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.dailyActivity.findMany({
      where: { enrollment: { courseId: course.id }, date: { gte: since } },
      select: { enrollmentId: true, date: true, activeSeconds: true },
    }),
  ]);

  const grid = new Map<string, number>();
  for (const row of activityRows) {
    const key = `${row.enrollmentId}:${row.date.toISOString().slice(0, 10)}`;
    grid.set(key, (grid.get(key) ?? 0) + row.activeSeconds);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href={`/courses/${course.slug}/reports`} className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Back to reports
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Daily activity — {course.title}</h1>
      <p className="mt-1 text-sm text-neutral-500">Study seconds logged via heartbeat (last 14 days, UTC).</p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
              <th className="px-4 py-3">Mentee</th>
              {days.map((day) => (
                <th key={day} className="px-2 py-3 text-center font-normal">
                  {new Date(`${day}T12:00:00Z`).toLocaleDateString(undefined, { month: "numeric", day: "numeric" })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {enrollments.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3 font-medium text-neutral-900">
                  <Link
                    href={`/courses/${course.slug}/mentees/${e.id}`}
                    className="underline-offset-2 hover:underline"
                  >
                    {e.user.name ?? e.user.email}
                  </Link>
                </td>
                {days.map((day) => {
                  const seconds = grid.get(`${e.id}:${day}`) ?? 0;
                  const intensity = seconds > 0 ? Math.min(1, seconds / 3600) : 0;
                  return (
                    <td key={day} className="px-2 py-3 text-center">
                      <span
                        className="inline-block min-w-[2.5rem] rounded px-1 py-0.5 text-[11px] tabular-nums"
                        style={{
                          backgroundColor: `rgba(23, 23, 23, ${0.08 + intensity * 0.35})`,
                        }}
                        title={formatStudyHours(seconds)}
                      >
                        {seconds > 0 ? Math.round(seconds / 60) : "—"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
