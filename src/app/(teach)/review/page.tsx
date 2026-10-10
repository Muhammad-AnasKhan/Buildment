import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { prisma } from "@/server/db";
import { nowMs } from "@/server/time";
import { requireTeachSurface } from "@/server/auth/guards";
import { AutoSubmitSelect } from "@/components/teach/auto-submit-select";

const AGING_HOURS = 48;

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const user = await requireTeachSurface();
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Answers to check
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Open answers waiting for your feedback — oldest first.
          </p>
        </div>

        {courses.length > 1 && (
          <form className="flex items-center gap-2" action="/review" method="GET">
            <AutoSubmitSelect
              name="courseId"
              defaultValue={courseFilter ?? ""}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
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
          <Inbox className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Nothing waiting</p>
          <p className="text-sm text-muted-foreground">
            When learners submit open answers in your courses, they appear here.
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
                  className={`flex items-center gap-4 rounded-xl border bg-card p-4 text-card-foreground transition-colors ${
                    isAging
                      ? "border-amber-400/50 bg-amber-500/10"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {response.user.name ?? response.user.email}
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · attempt {response.attempt}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {course.title} › {response.block.chapter.title}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {isAging && (
                      <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
                        {Math.floor(ageHours / 24) >= 1
                          ? `${Math.floor(ageHours / 24)}d waiting`
                          : `${Math.floor(ageHours)}h waiting`}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {response.submittedAt.toLocaleDateString()}
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
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
