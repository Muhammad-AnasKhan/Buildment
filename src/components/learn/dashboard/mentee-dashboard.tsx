import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileCheck2,
  History,
  Inbox,
  MessageSquareText,
  PlayCircle,
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
  DashboardEvent,
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
  const revisionCount = model.courses.filter((course) => course.state === "NEEDS_REVISION").length;
  const summary = revisionCount > 0
    ? `${revisionCount} submission${revisionCount === 1 ? " needs" : "s need"} revision.`
    : model.overview.pendingReviews > 0
      ? `${model.overview.pendingReviews} submission${model.overview.pendingReviews === 1 ? " is" : "s are"} waiting for mentor review.`
      : model.primaryCourse
        ? "Your next available learning step is ready below."
        : "Your assigned learning will appear here.";
  return (
    <header className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">My learning</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Welcome back, {model.learner.name}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{summary}</p>
      </div>
      <nav className="flex flex-wrap gap-2" aria-label="Learning links">
        <Link href="/progress" className={buttonVariants({ variant: "outline" })}>My progress</Link>
        <Link href="/my-questions" className={buttonVariants({ variant: "outline" })}>My help notes</Link>
      </nav>
    </header>
  );
}

function ContinueLearning({ course, running }: { course: DashboardCourse; running: MenteeDashboardViewModel["activity"]["runningSession"] }) {
  const status = statusDetails(course.state);
  return (
    <section aria-labelledby="continue-heading" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <p id="continue-heading" className="text-sm font-semibold text-foreground">Continue learning</p>
            <Badge variant={status.variant}>{status.label}</Badge>
            {running?.href === course.href && <Badge variant="outline">Session running</Badge>}
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{course.title}</h2>
          {course.currentModule && <p className="mt-2 text-sm text-muted-foreground">{course.currentModule}</p>}
          {course.targetChapter ? (
            <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{course.targetChapter.status === "IN_PROGRESS" ? "Current chapter" : "Next available chapter"}</p>
              <p className="mt-1 font-medium text-foreground">{course.targetChapter.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{course.targetChapter.blocksCompleted}/{course.targetChapter.blocksTotal} checkpoints complete</p>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No published chapters are available in this course yet.</div>
          )}
          <p className="mt-5 text-sm leading-6 text-muted-foreground">{course.actionReason}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href={course.href} className={buttonVariants({ size: "lg" })}>{course.actionLabel}<ArrowRight data-icon="inline-end" /></Link>
            <Link href={course.overviewHref} className={buttonVariants({ variant: "ghost", size: "lg" })}>Course overview</Link>
          </div>
        </div>
        <div className="border-t border-border bg-muted/25 p-5 lg:border-l lg:border-t-0 lg:p-7">
          <Progress value={course.percentComplete} className="gap-2"><ProgressLabel>Course progress</ProgressLabel><span className="ml-auto text-sm tabular-nums text-muted-foreground">{course.percentComplete}%</span></Progress>
          <dl className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-1">
            <div><dt className="text-xs text-muted-foreground">Chapters</dt><dd className="mt-1 font-semibold tabular-nums text-foreground">{course.chaptersCompleted} of {course.chaptersTotal}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Study time</dt><dd className="mt-1 font-semibold tabular-nums text-foreground">{formatStudyAmount(course.totalStudySeconds)}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Last activity</dt><dd className="mt-1 font-semibold text-foreground">{relativeTime(course.lastActiveAt)}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Mentor review</dt><dd className="mt-1 font-semibold tabular-nums text-foreground">{course.pendingReviews > 0 ? `${course.pendingReviews} pending` : "Nothing pending"}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}

const ACTION_ICONS: Record<DashboardAction["kind"], typeof RotateCcw> = { REVISION: RotateCcw, CONTINUE: PlayCircle, HELP: CircleHelp, START: BookOpen, FEEDBACK: MessageSquareText, PENDING_REVIEW: Clock3, REVIEW: History };

function ActionCenter({ actions, primaryCourse }: { actions: DashboardAction[]; primaryCourse: DashboardCourse | null }) {
  return (
    <section aria-labelledby="attention-heading">
      <div><h2 id="attention-heading" className="text-lg font-semibold tracking-tight text-foreground">What needs your attention</h2><p className="mt-1 text-sm text-muted-foreground">Review requests, active help notes, and waiting work.</p></div>
      {actions.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 p-5"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 size-5 text-muted-foreground" aria-hidden /><div><p className="font-medium text-foreground">Nothing needs attention right now</p><p className="mt-1 text-sm text-muted-foreground">{primaryCourse?.state === "NOT_STARTED" ? "Start your assigned course when you’re ready." : primaryCourse ? "Continue your current course when you’re ready." : "New assignments and feedback will appear here."}</p></div></div></div>
      ) : (
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {actions.map((action) => { const Icon = ACTION_ICONS[action.kind]; return (
            <li key={action.id}><Link href={action.href} className="group flex gap-3 p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:items-center"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background"><Icon className="size-4 text-muted-foreground" aria-hidden /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-foreground">{action.title}</p><Badge variant={action.kind === "REVISION" ? "destructive" : "outline"}>{action.statusLabel}</Badge></div><p className="mt-1 truncate text-xs text-muted-foreground">{action.context}</p><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{action.reason}</p></div><ArrowRight className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:mt-0" aria-hidden /></Link></li>
          ); })}
        </ul>
      )}
    </section>
  );
}

function LearningOverview({ overview }: { overview: MenteeDashboardViewModel["overview"] }) {
  const items = [["Assigned", overview.assignedCourses], ["In progress", overview.inProgressCourses], ["Completed", overview.completedCourses], ["Chapters", `${overview.chaptersCompleted}/${overview.chaptersTotal}`], ["Today", formatStudyAmount(overview.todaySeconds)], ["This week", formatStudyAmount(overview.weekSeconds)], ["Total study", formatStudyAmount(overview.totalSeconds)], ["Pending reviews", overview.pendingReviews], ["Open help", overview.openHelpRequests]];
  return <section aria-labelledby="overview-heading" className="rounded-xl border border-border bg-card p-5"><h2 id="overview-heading" className="text-sm font-semibold text-foreground">Learning overview</h2><dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">{items.map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</dd></div>)}</dl></section>;
}

function CourseCard({ course }: { course: DashboardCourse }) {
  const status = statusDetails(course.state);
  return (
    <article className={cn("overflow-hidden rounded-xl border border-border bg-card", course.state === "DROPPED" && "opacity-75")}>
      <div className="flex min-h-24 items-stretch border-b border-border bg-muted/30"><div className="flex w-28 shrink-0 items-center justify-center overflow-hidden bg-muted sm:w-36">{course.coverUrl ? (
        // Course covers may be mentor-provided remote URLs outside the configured image hosts.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={course.coverUrl} alt="" className="h-full w-full object-cover" />
      ) : <BookOpen className="size-7 text-muted-foreground/60" aria-hidden />}</div><div className="min-w-0 flex-1 p-4"><Badge variant={status.variant}>{status.label}</Badge><h3 className="mt-2 line-clamp-2 font-semibold text-foreground">{course.title}</h3>{course.currentModule && <p className="mt-1 truncate text-xs text-muted-foreground">{course.currentModule}</p>}</div></div>
      <div className="p-4"><Progress value={course.percentComplete} className="gap-2"><ProgressLabel className="text-xs">{course.chaptersCompleted}/{course.chaptersTotal} chapters</ProgressLabel><span className="ml-auto text-xs tabular-nums text-muted-foreground">{course.percentComplete}%</span></Progress>{course.targetChapter && <p className="mt-4 truncate text-sm text-foreground">{course.targetChapter.status === "IN_PROGRESS" ? "Current" : "Next"}: <span className="font-medium">{course.targetChapter.title}</span></p>}<div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span>{formatStudyAmount(course.totalStudySeconds)} studied</span><span>{relativeTime(course.lastActiveAt)}</span>{course.pendingReviews > 0 && <span>{course.pendingReviews} awaiting review</span>}{course.maxScore > 0 && <span>{course.totalScore}/{course.maxScore} points</span>}</div><div className="mt-5 flex items-center justify-between gap-3"><Link href={course.href} className={buttonVariants({ variant: course.state === "NEEDS_REVISION" ? "destructive" : "default" })}>{course.actionLabel}</Link><Link href={course.overviewHref} className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Course overview</Link></div></div>
    </article>
  );
}

function MyCourses({ courses }: { courses: DashboardCourse[] }) {
  return <section aria-labelledby="courses-heading"><div><h2 id="courses-heading" className="text-lg font-semibold tracking-tight text-foreground">My courses</h2><p className="mt-1 text-sm text-muted-foreground">All assigned courses and their next available steps.</p></div><div className="mt-4 grid gap-4 lg:grid-cols-2">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div></section>;
}

function ActivityChart({ activity }: { activity: MenteeDashboardViewModel["activity"] }) {
  const empty = activity.week.every((day) => day.seconds === 0);
  return <div className="mt-5">{empty ? <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">No recorded study activity in the last seven days.</div> : <div className="flex h-28 items-end gap-2" aria-label="Recorded study time for the last seven days" role="img">{activity.week.map(({ day, seconds }) => <div key={day} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="sr-only">{new Date(`${day}T12:00:00Z`).toLocaleDateString()}: {formatStudyAmount(seconds)}</span><div className="w-full rounded-md bg-primary/85" style={{ height: `${seconds === 0 ? 3 : Math.max(10, Math.round((seconds / activity.maxDaySeconds) * 76))}px` }} aria-hidden /><span className="text-[11px] text-muted-foreground">{new Date(`${day}T12:00:00Z`).toLocaleDateString(undefined, { weekday: "narrow" })}</span></div>)}</div>}</div>;
}

function ActivitySummary({ model }: { model: MenteeDashboardViewModel }) {
  const { activity, overview } = model;
  return <section aria-labelledby="activity-heading" className="rounded-xl border border-border bg-card p-5"><div className="flex items-start justify-between gap-4"><div><h2 id="activity-heading" className="font-semibold text-foreground">Total learner activity</h2><p className="mt-1 text-sm text-muted-foreground">Recorded activity reflects time spent, not understanding.</p></div><Clock3 className="size-5 text-muted-foreground" aria-hidden /></div><dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4"><div><dt className="text-xs text-muted-foreground">Today</dt><dd className="mt-1 font-semibold tabular-nums text-foreground">{formatStudyAmount(overview.todaySeconds)}</dd></div><div><dt className="text-xs text-muted-foreground">This week</dt><dd className="mt-1 font-semibold tabular-nums text-foreground">{formatStudyAmount(overview.weekSeconds)}</dd></div><div><dt className="text-xs text-muted-foreground">All time</dt><dd className="mt-1 font-semibold tabular-nums text-foreground">{formatStudyAmount(overview.totalSeconds)}</dd></div><div><dt className="text-xs text-muted-foreground">Active days</dt><dd className="mt-1 font-semibold tabular-nums text-foreground">{activity.activeDays} of 7</dd></div></dl><ActivityChart activity={activity} /><div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">{activity.runningSession && <Link href={activity.runningSession.href} className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2 font-medium text-foreground hover:bg-muted"><span className="truncate">Session running · {activity.runningSession.chapterTitle}</span><ArrowRight className="size-4 shrink-0" /></Link>}<p className="text-muted-foreground">Most recent chapter: {activity.recentChapter ? <Link href={activity.recentChapter.href} className="font-medium text-foreground hover:underline">{activity.recentChapter.title}</Link> : "No chapter activity yet"}</p><p className="text-muted-foreground">Last active: <span className="text-foreground">{relativeTime(activity.lastActiveAt)}</span></p></div></section>;
}

const EVENT_ICONS: Record<DashboardEvent["type"], typeof BookOpen> = { CHAPTER_STARTED: PlayCircle, CHAPTER_COMPLETED: CheckCircle2, SUBMISSION: FileCheck2, REVIEW: MessageSquareText, REVISION: RotateCcw, HELP_CREATED: CircleHelp, HELP_RESOLVED: CheckCircle2, STUDY_SESSION: Clock3 };

function RecentActivity({ events }: { events: DashboardEvent[] }) {
  return <section aria-labelledby="recent-heading" className="rounded-xl border border-border bg-card p-5"><h2 id="recent-heading" className="font-semibold text-foreground">Recent learning activity</h2><p className="mt-1 text-sm text-muted-foreground">A concise history of your latest learning events.</p>{events.length === 0 ? <p className="mt-8 text-sm text-muted-foreground">No recent learning activity yet.</p> : <ol className="mt-5 space-y-4">{events.map((event) => { const Icon = EVENT_ICONS[event.type]; return <li key={event.id} className="flex gap-3"><div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted"><Icon className="size-4 text-muted-foreground" aria-hidden /></div><div className="min-w-0 flex-1"><Link href={event.href} className="text-sm font-medium text-foreground hover:underline">{event.title}</Link><p className="mt-0.5 truncate text-xs text-muted-foreground">{event.context}</p></div><time dateTime={event.occurredAt} className="shrink-0 text-xs text-muted-foreground">{relativeTime(event.occurredAt)}</time></li>; })}</ol>}</section>;
}

function FeedbackAndHelp({ model }: { model: MenteeDashboardViewModel }) {
  return <div className="grid gap-4 md:grid-cols-2"><section aria-labelledby="feedback-heading" className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-2"><MessageSquareText className="size-4 text-muted-foreground" aria-hidden /><h2 id="feedback-heading" className="font-semibold text-foreground">Mentor feedback</h2></div>{model.latestFeedback ? <><Badge className="mt-4" variant={model.latestFeedback.kind === "REVISION" ? "destructive" : "outline"}>{model.latestFeedback.statusLabel}</Badge><p className="mt-3 font-medium text-foreground">{model.latestFeedback.title}</p><p className="mt-1 text-xs text-muted-foreground">{model.latestFeedback.context}</p><p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{model.latestFeedback.reason}</p><Link href={model.latestFeedback.href} className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>{model.latestFeedback.kind === "REVISION" ? "Create a new attempt" : "Open reviewed chapter"}</Link></> : <><p className="mt-4 text-sm text-muted-foreground">No mentor feedback yet.</p>{model.overview.pendingReviews > 0 && <p className="mt-2 text-sm text-foreground">{model.overview.pendingReviews} submission{model.overview.pendingReviews === 1 ? " is" : "s are"} awaiting review.</p>}</>}</section><section aria-labelledby="help-heading" className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-2"><CircleHelp className="size-4 text-muted-foreground" aria-hidden /><h2 id="help-heading" className="font-semibold text-foreground">Help and questions</h2></div><p className="mt-4 text-2xl font-semibold tabular-nums text-foreground">{model.help.openCount}</p><p className="text-sm text-muted-foreground">open help request{model.help.openCount === 1 ? "" : "s"}</p>{model.help.latest ? <div className="mt-4 rounded-lg bg-muted/40 p-3"><div className="flex items-center gap-2"><p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{model.help.latest.title}</p><Badge variant="outline">{model.help.latest.status === "OPEN" ? "Waiting" : "Resolved"}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{model.help.latest.courseTitle} · updated {relativeTime(model.help.latest.updatedAt)}</p><Link href={model.help.latest.href} className="mt-3 inline-flex text-sm font-medium text-foreground hover:underline">Open help note</Link></div> : <p className="mt-4 text-sm text-muted-foreground">No help requests yet. You can ask for help from any chapter.</p>}<Link href="/my-questions" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>My help notes</Link></section></div>;
}

function EmptyDashboard({ name }: { name: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center"><Inbox className="mx-auto size-8 text-muted-foreground" aria-hidden /><h2 className="mt-4 text-lg font-semibold text-foreground">No courses assigned yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{name}, your dashboard is ready. Assigned courses will appear here when a mentor adds you.</p><Link href="/my-questions" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>Open my help notes</Link></div>;
}

export function MenteeDashboard({ model }: { model: MenteeDashboardViewModel }) {
  return <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8"><DashboardHeader model={model} />{model.courses.length === 0 ? <div className="mt-8"><EmptyDashboard name={model.learner.name} /></div> : <div className="mt-8 space-y-10">{model.primaryCourse && <ContinueLearning course={model.primaryCourse} running={model.activity.runningSession} />}<LearningOverview overview={model.overview} /><div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]"><ActionCenter actions={model.actions} primaryCourse={model.primaryCourse} /><ActivitySummary model={model} /></div><MyCourses courses={model.courses} /><FeedbackAndHelp model={model} /><RecentActivity events={model.recentEvents} /></div>}</div>;
}
