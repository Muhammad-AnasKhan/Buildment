import Link from "next/link";
import { BookOpen } from "lucide-react";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/auth/guards";
import type { EnrollStatus } from "@/generated/prisma/client";

const STATUS_BADGE: Record<EnrollStatus, { label: string; className: string }> = {
  ASSIGNED: { label: "Assigned", className: "bg-neutral-100 text-neutral-600" },
  IN_PROGRESS: { label: "In progress", className: "bg-indigo-50 text-indigo-700" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
  DROPPED: { label: "Dropped", className: "bg-neutral-100 text-neutral-600" },
};

export default async function MenteeDashboardPage() {
  const user = await requireUser();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">My learning</h1>
      <p className="mt-1 text-sm text-neutral-500">Courses assigned to you by your mentor.</p>

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
          {enrollments.map(({ course, percentComplete, status }) => {
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
                href={`/courses/${course.slug}`}
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
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-neutral-500">
                      {percentComplete}% complete
                    </span>
                    <span className="text-sm font-medium text-indigo-600">{action}</span>
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
