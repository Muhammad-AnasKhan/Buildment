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
  Target,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { helpUiCopy } from "@/shared/lib/help-ui-copy";
import { formatStudyAmount } from "@/lib/format-study-duration";
import { WeeklyGoalEditor } from "@/components/learn/dashboard/weekly-goal-editor";
import type {
  DashboardAction,
  DashboardCourse,
  DashboardDay,
  DashboardEvent,
  MenteeDashboardViewModel,
} from "@/shared/api/learner";

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
    case "PAYMENT_REQUIRED": return { label: "Payment due", variant: "destructive" as const };
    case "NEEDS_REVISION": return { label: "Feedback to try", variant: "secondary" as const };
    case "AWAITING_REVIEW": return { label: "Awaiting review", variant: "secondary" as const };
    case "IN_PROGRESS": return { label: "In progress", variant: "secondary" as const };
    case "NOT_STARTED": return { label: "Ready to begin", variant: "outline" as const };
    case "COMPLETED": return { label: "Completed", variant: "outline" as const };
    case "DROPPED": return { label: "Dropped", variant: "outline" as const };
  }
}

function DashboardHeader({ model }: { model: MenteeDashboardViewModel }) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">My learning</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          {model.courses.length === 0 ? "Welcome" : "Welcome back"}, {model.learner.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Take one step at a time. You can pick up from here when you are ready.
        </p>
      </div>
      <WeeklyGoalEditor goal={model.habit.weeklyGoal} />
    </header>
  );
}

function ContinueLearning({ course }: { course: DashboardCourse }) {
  const status = statusDetails(course.state);
  return (
    <section aria-labelledby="continue-heading" className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <BookOpen className="size-5 text-primary" aria-hidden />
        <p id="continue-heading" className="text-sm font-semibold">{course.state === "IN_PROGRESS" ? "Continue where you left off" : course.state === "COMPLETED" ? "Look how far you have come" : "Your next step"}</p>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      <h2 className="mt-4 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
        {course.title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {[course.currentModule, course.targetChapter?.title].filter(Boolean).join(" · ")}
      </p>
      <div className="mt-6">
        <Progress value={course.percentComplete} className="gap-2 [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-indicator]]:duration-200 motion-reduce:[&_[data-slot=progress-indicator]]:transition-none">
          <ProgressLabel className="text-xs text-muted-foreground">
            {course.chaptersCompleted} of {course.chaptersTotal} chapters complete
          </ProgressLabel>
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">
            {course.percentComplete === 0 && course.chaptersCompleted > 0 ? "<1" : course.percentComplete}%
          </span>
        </Progress>
      </div>
      {course.targetChapter && course.targetChapter.blocksTotal > 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {course.targetChapter.blocksCompleted} of {course.targetChapter.blocksTotal} checkpoints complete in this chapter.
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href={course.href}
          className={buttonVariants({
            size: "lg",
            variant: "default",
            className: "h-auto min-h-11 max-w-full whitespace-normal py-3 text-center transition-colors duration-200 active:bg-primary/80 motion-reduce:transition-none",
          })}
        >
          {course.actionLabel}
          <ArrowRight data-icon="inline-end" />
        </Link>
        <Link href={course.overviewHref} className={buttonVariants({ variant: "ghost", size: "lg" })}>
          View course
        </Link>
      </div>
      </div>
    </section>
  );
}

function weekdayLabel(day: string) {
  const date = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return day.slice(-2);
  return date.toLocaleDateString(undefined, { weekday: "narrow", timeZone: "UTC" });
}

function ActivityStrip({ days, maxSeconds }: { days: DashboardDay[]; maxSeconds: number }) {
  return (
    <div className="mt-4">
      <p className="text-xs text-muted-foreground">Estimated active time</p>
      <div className="mt-2 flex items-end gap-1.5" role="img" aria-label="Estimated study time for the last 7 days">
        {days.map((day) => {
          const height = day.seconds <= 0 ? 0 : Math.max(12, Math.round((day.seconds / Math.max(1, maxSeconds)) * 100));
          return (
            <div key={day.day} className="flex min-w-0 flex-1 flex-col items-center gap-1" title={`${day.day}: ${formatStudyAmount(day.seconds)}`}>
              <div className="flex h-12 w-full items-end rounded-sm bg-muted">
                <div className="w-full rounded-sm bg-primary" style={{ height: `${height}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{weekdayLabel(day.day)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklySnapshot({ model }: { model: MenteeDashboardViewModel }) {
  const metrics = [
    { label: "Estimated study this week", value: formatStudyAmount(model.overview.weekSeconds) },
    { label: "Active days", value: `${model.activity.activeDays} of 7` },
    { label: "Chapters completed", value: String(model.overview.chaptersCompleted) },
    { label: "Awaiting review", value: String(model.overview.pendingReviews) },
  ];

  return (
    <section aria-labelledby="snapshot-heading" className="self-start rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <Clock3 className="size-4 text-muted-foreground" aria-hidden />
        <h2 id="snapshot-heading" className="text-sm font-semibold">This week</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {model.habit.streakCount === 0
          ? "Every visit counts. Learn at your own pace."
          : `${model.habit.streakCount}-day learning streak. One step at a time.`}

      </p>
      <ActivityStrip days={model.activity.week} maxSeconds={model.activity.maxDaySeconds} />
      <dl className="mt-4 divide-y divide-border">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <dt className="text-sm text-muted-foreground">{metric.label}</dt>
            <dd className="text-sm font-semibold tabular-nums">{metric.value}</dd>
          </div>
        ))}
      </dl>
      {model.habit.weeklyGoal ? (
        <div className="mt-5 rounded-xl border bg-muted/20 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold"><Target className="size-4" aria-hidden /> Weekly goal</span>
            <span className="text-xs font-medium tabular-nums text-muted-foreground">{Math.min(model.habit.weeklyGoal.progress, model.habit.weeklyGoal.target)} / {model.habit.weeklyGoal.target}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {model.habit.weeklyGoal.progress >= model.habit.weeklyGoal.target ? "You reached your goal. Your effort adds up." : `${model.habit.weeklyGoal.target - model.habit.weeklyGoal.progress} ${model.habit.weeklyGoal.kind === "CHAPTERS" ? "chapters" : "sessions"} to go this week`}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Weekly goal progress" aria-valuenow={Math.min(model.habit.weeklyGoal.progress, model.habit.weeklyGoal.target)} aria-valuemin={0} aria-valuemax={model.habit.weeklyGoal.target}>
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.round((model.habit.weeklyGoal.progress / model.habit.weeklyGoal.target) * 100))}%` }} />
          </div>
          {model.habit.weeklyGoal.note ? <p className="mt-3 text-xs leading-5 text-muted-foreground">Focus: {model.habit.weeklyGoal.note}</p> : null}
          {model.habit.weeklyGoal.dailyReminder ? <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="size-3.5" aria-hidden /> Daily email reminder on</p> : null}
        </div>
      ) : null}
      <p className="mt-4 text-xs leading-5 text-muted-foreground">Breaks are part of learning. Your completed work stays with you.</p>
      <Link href="/progress" className="mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline">
        View progress details <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </section>
  );
}

function ResumeBanner({ session }: { session: NonNullable<MenteeDashboardViewModel["activity"]["runningSession"]> }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold">You were studying {session.chapterTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{session.courseTitle}</p>
      </div>
      <Link href={session.href} className={buttonVariants()}>
        Continue
        <ArrowRight data-icon="inline-end" />
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
    <section aria-labelledby="attention-heading" className="min-w-0">
      <div>
        <h2 id="attention-heading" className="text-lg font-semibold tracking-tight">Your next steps</h2>
        <p className="mt-1 text-sm text-muted-foreground">Feedback and support for your learning.</p>
      </div>
      {visible.length > 0 ? (
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border bg-card">
          {visible.map((action) => {
            const Icon = ACTION_ICONS[action.kind];
            return (
              <li key={action.id}>
                <Link
                  href={action.href}
                  className="group flex items-center gap-3 p-4 outline-none transition-colors duration-200 motion-reduce:transition-none active:bg-muted hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">{action.title}</span>
                      {action.kind === "REVISION" ? <Badge variant="secondary">Feedback</Badge> : null}
                      {action.unread ? <Badge variant="secondary">Unread</Badge> : null}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{action.context}</span>
                    <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">{action.reason}</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none motion-safe:group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-dashed bg-muted/20 p-4">
          <CheckCircle2 className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
          <div>
            <p className="text-sm font-medium">You are all caught up</p>
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
    <section aria-labelledby="courses-preview-heading" className="min-w-0">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="courses-preview-heading" className="text-lg font-semibold tracking-tight">My courses</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your progress, one chapter at a time.</p>
        </div>
        <Link href="/my-courses" className="shrink-0 text-sm font-medium hover:underline">View all</Link>
      </div>
      <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border bg-card">
        {courses.slice(0, 4).map((course) => {
          const status = statusDetails(course.state);
          return (
            <div key={course.id} className="flex items-center gap-2 p-4">
              <Link
                href={course.href}
                className="group flex min-w-0 flex-1 items-center gap-4 rounded-lg outline-none transition-colors duration-200 motion-reduce:transition-none active:bg-muted hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                  {course.state === "COMPLETED" ? <CheckCircle2 className="size-5" aria-hidden /> : <BookOpen className="size-5" aria-hidden />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{course.title}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {course.actionLabel} · {course.percentComplete === 0 && course.chaptersCompleted > 0 ? "<1" : course.percentComplete}% complete · {relativeTime(course.lastActiveAt)}
                  </span>
                </span>
                <Badge variant={status.variant} className="hidden sm:inline-flex">{status.label}</Badge>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none motion-safe:group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link href={course.overviewHref} className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Overview
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CourseCard({ course, featured }: { course: DashboardCourse; featured: boolean }) {
  const status = statusDetails(course.state);
  return (
    <article className={cn("overflow-hidden rounded-2xl border bg-card transition-shadow duration-200 hover:shadow-sm focus-within:ring-2 focus-within:ring-ring motion-reduce:transition-none", featured && "border-primary/40")}>
      {featured ? <p className="border-b border-border bg-muted px-4 py-3 text-sm font-medium">{course.state === "IN_PROGRESS" ? "Continue where you left off" : "Your next step"}</p> : null}
      <div className="flex min-h-24 items-stretch border-b bg-muted/30">
        <div className="min-w-0 flex-1 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            {course.pendingReviews > 0 ? (
              <Badge variant="secondary" className="gap-1">
                <MessageSquareText className="size-3" aria-hidden />
                {course.pendingReviews} review
              </Badge>
            ) : null}
          </div>
          <h3 className="mt-2 line-clamp-2 font-semibold">{course.title}</h3>
          {course.currentModule ? <p className="mt-1 truncate text-xs text-muted-foreground">{course.currentModule}</p> : null}
        </div>
      </div>
      <div className="p-4">
        <Progress value={course.percentComplete} className="gap-2 [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-indicator]]:duration-200 motion-reduce:[&_[data-slot=progress-indicator]]:transition-none">
          <ProgressLabel className="text-xs">{course.chaptersCompleted} of {course.chaptersTotal} chapters complete</ProgressLabel>
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">{course.percentComplete === 0 && course.chaptersCompleted > 0 ? "<1" : course.percentComplete}%</span>
        </Progress>
        {course.targetChapter ? <p className="mt-4 text-sm leading-6">{course.targetChapter.status === "IN_PROGRESS" ? "Current" : "Next"}: <span className="font-medium">{course.targetChapter.title}</span></p> : null}
        {course.state === "COMPLETED" ? <p className="mt-4 flex items-start gap-2 text-sm leading-6"><CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" aria-hidden />You completed this course. Take a moment to see what you have learned.</p> : null}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{formatStudyAmount(course.totalStudySeconds)} studied</span>
          <span>{relativeTime(course.lastActiveAt)}</span>
          {course.maxScore > 0 ? <span>{Math.round((course.totalScore / course.maxScore) * 100)}% scored accuracy</span> : null}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={course.href}
            className={buttonVariants({
              variant: "default",
            className: "h-auto min-h-11 max-w-full whitespace-normal py-3 text-center transition-colors duration-200 active:bg-primary/80 motion-reduce:transition-none",
            })}
          >
            {course.actionLabel}
          </Link>
          <Link href={course.overviewHref} className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Course overview</Link>
        </div>
      </div>
    </article>
  );
}

export function MenteeCourseList({ courses, showHeading = true, primaryCourseId }: { courses: DashboardCourse[]; showHeading?: boolean; primaryCourseId?: string }) {
  const orderedCourses = [...courses].sort((a, b) => Number(b.id === primaryCourseId) - Number(a.id === primaryCourseId));
  return (
    <section aria-labelledby={showHeading ? "courses-heading" : undefined}>
      {showHeading ? <div><h2 id="courses-heading" className="text-lg font-semibold tracking-tight">My courses</h2><p className="mt-1 text-sm text-muted-foreground">All assigned courses and their next available steps.</p></div> : null}
      <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-2", showHeading && "mt-4")}>
        {orderedCourses.map((course) => <CourseCard key={course.id} course={course} featured={course.id === primaryCourseId && course.state !== "COMPLETED"} />)}
      </div>
    </section>
  );
}

function EmptyDashboard({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
      <Inbox className="mx-auto size-8 text-muted-foreground" aria-hidden />
      <h2 className="mt-4 text-lg font-semibold">Your learning starts here</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {name}, choose a course from the catalog to get started. If your mentor sent an invite, open its link to join your course.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/catalog" className={buttonVariants()}>Browse catalog</Link>
        <Link href="/my-questions" className={buttonVariants({ variant: "outline" })}>{helpUiCopy.learnerNav}</Link>
      </div>
    </div>
  );
}

function RecentEvents({ events }: { events: DashboardEvent[] }) {
  if (events.length === 0) return null;
  return (
    <section aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="text-lg font-semibold tracking-tight">Recent activity</h2>
      <p className="mt-1 text-sm text-muted-foreground">Chapters, submissions, reviews, and study sessions.</p>
      <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border bg-card">
        {events.slice(0, 6).map((event) => (
          <li key={event.id}>
            <Link href={event.href} className="flex items-center justify-between gap-4 p-4 transition-colors duration-200 motion-reduce:transition-none active:bg-muted hover:bg-muted/50">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{event.title}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{event.context}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(event.occurredAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
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
          {model.activity.runningSession ? <ResumeBanner session={model.activity.runningSession} /> : null}
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
            {model.primaryCourse ? <ContinueLearning course={model.primaryCourse} /> : null}
            <WeeklySnapshot model={model} />
          </div>
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <ActionCenter actions={model.actions} hasCourse={Boolean(model.primaryCourse)} />
            <CourseListPreview courses={model.courses} />
          </div>
          <RecentEvents events={model.recentEvents} />
        </div>
      )}
    </div>
  );
}
