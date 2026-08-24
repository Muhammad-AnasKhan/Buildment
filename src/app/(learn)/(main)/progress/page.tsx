import { BookOpen } from "lucide-react";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/auth/guards";

export default async function MenteeProgressPage() {
  const user = await requireUser();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: { _count: { select: { chapters: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

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
        <div className="mt-8 space-y-3">
          {enrollments.map(({ course, percentComplete, chaptersCompleted, lastActiveAt }) => {
            const totalChapters = course._count.chapters;

            return (
              <div key={course.id} className="rounded-xl border border-neutral-200 bg-white p-5">
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
                    className="h-full rounded-full bg-indigo-600"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>

                <p className="mt-3 text-sm text-neutral-500">
                  {chaptersCompleted}/{totalChapters} chapters completed
                  <span className="text-neutral-300"> · </span>
                  {lastActiveAt
                    ? `Last active ${lastActiveAt.toLocaleDateString()}`
                    : "No activity yet"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
