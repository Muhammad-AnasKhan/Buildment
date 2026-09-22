import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { prisma } from "@/server/db";
import { nowMs } from "@/server/time";
import { requireRole } from "@/server/auth/guards";
import { AutoSubmitSelect } from "@/components/teach/auto-submit-select";

const AGING_HOURS = 48;

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const user = await requireRole("MENTOR", "ADMIN");
  const { courseId: courseFilter } = await searchParams;

  const courses = await prisma.course.findMany({
    where: user.role === "ADMIN" ? undefined : { mentorId: user.id },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });
  const courseIds = courses.map((course) => course.id);

  const pending =
    courseIds.length === 0
      ? []
      : await prisma.response.findMany({
          where: {
            status: "PENDING_REVIEW",
            block: {
              chapter: {
                courseId: courseFilter && courseIds.includes(courseFilter)
                  ? courseFilter
                  : { in: courseIds },
              },
            },
          },
          orderBy: { submittedAt: "asc" },
          include: {
            user: { select: { id: true, name: true, email: true } },
            block: {
              select: {
                id: true,
                type: true,
                chapter: {
                  select: { title: true, course: { select: { id: true, slug: true, title: true } } },
                },
              },
            },
          },
        });

  // Resubmissions after a needs-revision verdict jump the queue (docs/05),
  // then both groups stay oldest-first internally.
  pending.sort((a, b) => {
    const aResub = a.attempt > 1 ? 0 : 1;
    const bResub = b.attempt > 1 ? 0 : 1;
    if (aResub !== bResub) return aResub - bResub;
    return a.submittedAt.getTime() - b.submittedAt.getTime();
  });

  const now = nowMs();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Review queue
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Open answers waiting for your feedback — oldest first.
          </p>
        </div>

        {courses.length > 1 && (
          <form className="flex items-center gap-2" action="/review" method="GET">
            <AutoSubmitSelect
              name="courseId"
              defaultValue={courseFilter ?? ""}
              className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-indigo-300"
            >
              <option value="">All courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </AutoSubmitSelect>
          </form>
        )}
      </div>

      {pending.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-2 text-center">
          <Inbox className="size-8 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-700">Nothing waiting for review</p>
          <p className="text-sm text-neutral-400">
            When mentees submit open answers in your courses, they appear here.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {pending.map((response) => {
            const ageHours = (now - response.submittedAt.getTime()) / (1000 * 60 * 60);
            const isAging = ageHours >= AGING_HOURS;
            const course = response.block.chapter.course;

            return (
              <li key={response.id}>
                <Link
                  href={`/review/${response.id}`}
                  className={`flex items-center gap-4 rounded-xl border bg-white p-4 transition-colors ${
                    isAging
                      ? "border-amber-300 bg-amber-50/30 hover:border-amber-400"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {response.user.name ?? response.user.email}
                      <span className="font-normal text-neutral-400">
                        {" "}
                        · attempt {response.attempt}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {course.title} › {response.block.chapter.title}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {isAging && (
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        {Math.floor(ageHours / 24) >= 1
                          ? `${Math.floor(ageHours / 24)}d waiting`
                          : `${Math.floor(ageHours)}h waiting`}
                      </span>
                    )}
                    <span className="text-xs text-neutral-400">
                      {response.submittedAt.toLocaleDateString()}
                    </span>
                    <ChevronRight className="size-4 text-neutral-300" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
