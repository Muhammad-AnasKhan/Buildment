import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import type { ReviewQueueView } from "@/shared/api/teach";
import { nowMs } from "@/server/time";
import { requireTeachSurface } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";
import { AutoSubmitSelect } from "@/components/teach/auto-submit-select";

const AGING_HOURS = 48;

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  await requireTeachSurface();
  const { courseId: courseFilter } = await searchParams;
  const query = courseFilter ? `?courseId=${encodeURIComponent(courseFilter)}` : "";
  const { courses, items } = await serverApiFetch<ReviewQueueView>(`/api/v1/teach/review${query}`);
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

      {items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-2 text-center">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Nothing waiting</p>
          <p className="text-sm text-muted-foreground">
            When learners submit open answers in your courses, they appear here.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((response) => {
            const submittedAt = new Date(response.submittedAt);
            const ageHours = (now - submittedAt.getTime()) / (1000 * 60 * 60);
            const isAging = ageHours >= AGING_HOURS;

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
                      {response.learnerLabel}
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · attempt {response.attempt}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {response.courseTitle} › {response.chapterTitle}
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
                      {submittedAt.toLocaleDateString()}
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
