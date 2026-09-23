import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Inbox,
  MessageSquareText,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatStudyAmount } from "@/lib/format-study-duration";
import type {
  DashboardAction,
  DashboardCourse,
  MenteeDashboardViewModel,
} from "@/server/dashboard/dashboard-model";

function relativeTime(value: string | null) {
  if (!value) return "No activity yet";
  const date = new Date(value);
  const elapsed = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(elapsed / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function statusDetails(state: DashboardCourse["state"]) {
  switch (state) {
    case "NEEDS_REVISION": return { label: "Needs revision", variant: "destructive" as const };
    case "AWAITING_REVIEW": return { label: "Awaiting review", variant: "secondary" as const };
    case "IN_PROGRESS": return { label: "In progress", variant: "secondary" as const };
    case "NOT_STARTED": return { label: "Not started", variant: "outline" as const };
    case "COMPLETED": return { label: "Completed", variant: "outline" as const };
    case "DROPPED": return { label: "Dropped", variant: "outline" as const };
  }
}

function DashboardHeader({ model }: { model: MenteeDashboardViewModel }) {
  return (
    <header className="border-b border-border pb-6">
      <p className="text-sm font-medium text-muted-foreground">My learning</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
        Welcome back, {model.learner.name}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Continue your current work and handle anything that needs your attention.
      </p>
    </header>
  );
}

function ContinueLearning({ course }: { course: DashboardCourse }) {
  const status = statusDetails(course.state);
  return (
    <section aria-labelledby="continue-heading" className="rounded-2xl border bg-card p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <p id="continue-heading" className="text-sm font-semibold">Up next</p>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      <h2 className="mt-4 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
        {course.title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {[course.currentModule, course.targetChapter?.title].filter(Boolean).join(" · ")}
      </p>
      <div className="mt-6">
        <Progress value={course.percentComplete} className="gap-2">
          <ProgressLabel className="text-xs text-muted-foreground">
            {course.chaptersCompleted} of {course.chaptersTotal} chapters
          </ProgressLabel>
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">
            {course.percentComplete}%
          </span>
        </Progress>
      </div>
      {course.targetChapter ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {course.targetChapter.blocksCompleted}/{course.targetChapter.blocksTotal} checkpoints complete in this chapter.
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href={course.href} className={buttonVariants({ size: "lg" })}>
          {course.actionLabel}
          <ArrowRight data-icon="inline-end" />
        </Link>
        <Link href={course.overviewHref} className={buttonVariants({ variant: "ghost", size: "lg" })}>
          View course
        </Link>
      </div>
    </section>
  );
}

function WeeklySnapshot({ model }: { model: MenteeDashboardViewModel }) {
  const accuracy = model.primaryCourse && model.primaryCourse.maxScore > 0
    ? Math.round((model.primaryCourse.totalScore / model.primaryCourse.maxScore) * 100)
    : null;
  const metrics = [
    { label: "Study this week", value: formatStudyAmount(model.overview.weekSeconds) },
    { label: "Active days", value: `${model.activity.activeDays} of 7` },
    { label: "Scored accuracy", value: accuracy === null ? "Not scored" : `${accuracy}%` },
    { label: "Awaiting review", value: String(model.overview.pendingReviews) },
  ];

  return (
    <section aria-labelledby="snapshot-heading" className="rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <Clock3 className="size-4 text-muted-foreground" aria-hidden />
        <h2 id="snapshot-heading" className="text-sm font-semibold">This week</h2>
      </div>
      <dl className="mt-4 divide-y divide-border">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <dt className="text-sm text-muted-foreground">{metric.label}</dt>
            <dd className="text-sm font-semibold tabular-nums">{metric.value}</dd>
          </div>
        ))}
      </dl>
      <Link href="/progress" className="mt-5 inline-flex items-center gap-1 text-sm font-medium hover:underline">
        View progress details <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </section>
  );
}

const ACTION_ICONS: Record<DashboardAction["kind"], typeof RotateCcw> = {
  REVISION: RotateCcw,
  CONTINUE: BookOpen,
  HELP: CircleHelp,
  START: BookOpen,
  FEEDBACK: MessageSquareText,
  PENDING_REVIEW: Clock3,
  REVIEW: MessageSquareText,
};

function ActionCenter({ actions, hasCourse }: { actions: DashboardAction[]; hasCourse: boolean }) {
  const visible = actions
    .filter(
      (action, index, all) =>
        all.findIndex((candidate) => candidate.href === action.href && candidate.title === action.title) === index
    )
    .slice(0, 4);
  return (
    <section aria-labelledby="attention-heading">
      <div>
        <h2 id="attention-heading" className="text-lg font-semibold tracking-tight">Needs attention</h2>
        <p className="mt-1 text-sm text-muted-foreground">Feedback, revisions, and open requests.</p>
      </div>
      {visible.length > 0 ? (
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border bg-card">
          {visible.map((action) => {
            const Icon = ACTION_ICONS[action.kind];
            return (
              <li key={action.id}>
                <Link
                  href={action.href}
                  className="group flex items-center gap-3 p-4 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">{action.title}</span>
                      {action.kind === "REVISION" ? <Badge variant="destructive">Revision</Badge> : null}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{action.context}</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-dashed bg-muted/20 p-4">
          <CheckCircle2 className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
          <div>
            <p className="text-sm font-medium">Nothing needs attention</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasCourse ? "You can continue learning when you’re ready." : "New assignments will appear here."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function CourseListPreview({ courses }: { courses: DashboardCourse[] }) {
  return (
    <section aria-labelledby="courses-preview-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="courses-preview-heading" className="text-lg font-semibold tracking-tight">My courses</h2>
          <p className="mt-1 text-sm text-muted-foreground">A quick view of every assignment.</p>
        </div>
        <Link href="/my-courses" className="shrink-0 text-sm font-medium hover:underline">View all</Link>
      </div>
      <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border bg-card">
        {courses.slice(0, 4).map((course) => {
          const status = statusDetails(course.state);
          return (
            <Link
              key={course.id}
              href={course.overviewHref}
              className="group flex items-center gap-4 p-4 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
                <BookOpen className="size-4 text-muted-foreground" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{course.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {course.percentComplete}% complete · {relativeTime(course.lastActiveAt)}
                </span>
              </span>
              <Badge variant={status.variant} className="hidden sm:inline-flex">{status.label}</Badge>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function CourseCard({ course }: { course: DashboardCourse }) {
  const status = statusDetails(course.state);
  return (
    <article className={cn("overflow-hidden rounded-xl border bg-card", course.state === "DROPPED" && "opacity-75")}>
      <div className="flex min-h-24 items-stretch border-b bg-muted/30">
        <div className="flex w-28 shrink-0 items-center justify-center overflow-hidden bg-muted sm:w-36">
          {course.coverUrl ? (
            // Course covers may be mentor-provided remote URLs outside the configured image hosts.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.coverUrl} alt="" className="h-full w-full object-cover" />
          ) : <BookOpen className="size-7 text-muted-foreground/60" aria-hidden />}
        </div>
        <div className="min-w-0 flex-1 p-4">
          <Badge variant={status.variant}>{status.label}</Badge>
          <h3 className="mt-2 line-clamp-2 font-semibold">{course.title}</h3>
          {course.currentModule ? <p className="mt-1 truncate text-xs text-muted-foreground">{course.currentModule}</p> : null}
        </div>
      </div>
      <div className="p-4">
        <Progress value={course.percentComplete} className="gap-2">
          <ProgressLabel className="text-xs">{course.chaptersCompleted}/{course.chaptersTotal} chapters</ProgressLabel>
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">{course.percentComplete}%</span>
        </Progress>
        {course.targetChapter ? <p className="mt-4 truncate text-sm">{course.targetChapter.status === "IN_PROGRESS" ? "Current" : "Next"}: <span className="font-medium">{course.targetChapter.title}</span></p> : null}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{formatStudyAmount(course.totalStudySeconds)} studied</span>
          <span>{relativeTime(course.lastActiveAt)}</span>
          {course.maxScore > 0 ? <span>{Math.round((course.totalScore / course.maxScore) * 100)}% scored accuracy</span> : null}
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <Link href={course.href} className={buttonVariants({ variant: course.state === "NEEDS_REVISION" ? "destructive" : "default" })}>{course.actionLabel}</Link>
          <Link href={course.overviewHref} className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Course overview</Link>
        </div>
      </div>
    </article>
  );
}

export function MenteeCourseList({ courses, showHeading = true }: { courses: DashboardCourse[]; showHeading?: boolean }) {
  return (
    <section aria-labelledby={showHeading ? "courses-heading" : undefined}>
      {showHeading ? <div><h2 id="courses-heading" className="text-lg font-semibold tracking-tight">My courses</h2><p className="mt-1 text-sm text-muted-foreground">All assigned courses and their next available steps.</p></div> : null}
      <div className={cn("grid gap-4 lg:grid-cols-2", showHeading && "mt-4")}>
        {courses.map((course) => <CourseCard key={course.id} course={course} />)}
      </div>
    </section>
  );
}

function EmptyDashboard({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
      <Inbox className="mx-auto size-8 text-muted-foreground" aria-hidden />
      <h2 className="mt-4 text-lg font-semibold">No courses assigned yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {name}, your dashboard is ready. Assigned courses will appear here when a mentor adds you.
      </p>
      <Link href="/my-questions" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>Open my help notes</Link>
    </div>
  );
}

export function MenteeDashboard({ model }: { model: MenteeDashboardViewModel }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <DashboardHeader model={model} />
      {model.courses.length === 0 ? (
        <div className="mt-8"><EmptyDashboard name={model.learner.name} /></div>
      ) : (
        <div className="mt-8 space-y-9">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
            {model.primaryCourse ? <ContinueLearning course={model.primaryCourse} /> : null}
            <WeeklySnapshot model={model} />
          </div>
          <div className="grid gap-8 xl:grid-cols-2">
            <ActionCenter actions={model.actions} hasCourse={Boolean(model.primaryCourse)} />
            <CourseListPreview courses={model.courses} />
          </div>
        </div>
      )}
    </div>
  );
}
