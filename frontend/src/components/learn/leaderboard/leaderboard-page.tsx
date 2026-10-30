"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, Trophy } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InfoTip } from "@/components/ui/info-tip";
import { cn } from "@/lib/utils";
import { loadLeaderboard, setGamificationPreferences } from "@/server/actions/gamification";
import type { LeaderboardEntry, LeaderboardView } from "@/shared/api/gamification";

type CourseOption = { courseId: string; title: string };
const numberFormat = new Intl.NumberFormat();

function resetLabel(resetsAt: string) {
  const ms = Date.parse(resetsAt) - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return "Resets soon";
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `Resets in ${days} day${days === 1 ? "" : "s"}`;
  const hours = Math.max(1, Math.floor(ms / 3_600_000));
  return `Resets in ${hours} hour${hours === 1 ? "" : "s"}`;
}

function BestWeek({ xp, best }: { xp: number; best: number }) {
  if (best <= 0) {
    return <p className="text-sm text-muted-foreground">Your first week on this board. Every chapter counts.</p>;
  }
  const beaten = xp > best;
  const percent = Math.min(100, Math.round((xp / best) * 100));
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className={cn("font-medium", beaten ? "text-primary" : "text-foreground")}>
          {beaten ? "New personal best!" : "Beat your best week"}
        </span>
        <span className="tabular-nums text-muted-foreground">
          {numberFormat.format(xp)} / {numberFormat.format(best)} XP
        </span>
      </div>
      <div
        className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="This week compared with your best week"
        aria-valuenow={Math.min(xp, best)}
        aria-valuemin={0}
        aria-valuemax={best}
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

const MEDAL_TONES: Record<number, string> = {
  1: "bg-brand-yellow text-foreground",
  2: "bg-muted text-foreground",
  3: "bg-brand-yellow/40 text-foreground",
};

function RankBadge({ rank, highlight }: { rank: number; highlight?: boolean }) {
  const medal = MEDAL_TONES[rank];
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums",
        medal ?? (highlight ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")
      )}
      aria-hidden
    >
      {rank}
    </span>
  );
}

function LastWeekWinners({ winners }: { winners: LeaderboardEntry[] }) {
  return (
    <section aria-labelledby="last-week-heading" className="rounded-2xl border bg-card p-5 sm:p-6">
      <h2 id="last-week-heading" className="text-lg font-semibold tracking-[-0.02em]">Last week&apos;s winners</h2>
      <p className="mt-1 text-sm text-muted-foreground">Top three from the board that just closed.</p>
      <ol className="mt-5 grid gap-3 sm:grid-cols-3">
        {winners.map((winner) => (
          <li
            key={winner.rank}
            className={cn(
              "flex flex-col items-center rounded-xl border px-3 py-5 text-center",
              winner.isYou ? "border-brand-yellow bg-brand-yellow/15" : "bg-muted/30"
            )}
          >
            <RankBadge rank={winner.rank} />
            <span className={cn("mt-3 w-full truncate text-sm", winner.isYou ? "font-semibold" : "font-medium")}>
              <span className="sr-only">Place {winner.rank}: </span>
              {winner.isYou ? "You" : winner.name}
            </span>
            <span className="mt-1 text-sm tabular-nums text-muted-foreground">{numberFormat.format(winner.xp)} XP</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function LeaderboardPage({
  initial,
  initialCourseId,
  courses,
  featuresEnabled,
}: {
  initial: LeaderboardView | null;
  initialCourseId: string | null;
  courses: CourseOption[];
  featuresEnabled: boolean;
}) {
  const [view, setView] = useState(initial);
  const [courseId, setCourseId] = useState(initialCourseId ?? courses[0]?.courseId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(work: () => Promise<LeaderboardView | null>) {
    setError(null);
    startTransition(async () => {
      try {
        setView(await work());
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  const courseTitle =
    courses.find((course) => course.courseId === courseId)?.title ??
    (view && "courseTitle" in view ? view.courseTitle : "Course");

  const switchCourse = (next: string) => {
    setCourseId(next);
    run(() => loadLeaderboard(next));
  };
  const join = () =>
    run(async () => {
      await setGamificationPreferences({ leaderboardOptIn: true });
      return loadLeaderboard(courseId);
    });
  const leave = () =>
    run(async () => {
      await setGamificationPreferences({ leaderboardOptIn: false });
      return loadLeaderboard(courseId);
    });

  if (!featuresEnabled) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <header className="border-b pb-7">
          <p className="text-sm font-medium text-muted-foreground">Competition</p>
          <h1 className="mt-1 text-[32px] leading-tight tracking-[-0.035em] sm:text-[40px]">Leaderboard</h1>
        </header>
        <div className="mt-10 rounded-2xl border bg-card px-6 py-12 text-center">
          <Trophy className="mx-auto size-10 text-muted-foreground" aria-hidden />
          <h2 className="mt-4 text-xl tracking-[-0.02em]">Leaderboards are off</h2>
          <p className="mx-auto mt-2 max-w-md text-base text-muted-foreground">
            Game elements are hidden or unavailable on your account. You can turn them back on in profile settings.
          </p>
          <Link href="/settings/profile" className={cn(buttonVariants(), "mt-6")}>
            Open profile settings
          </Link>
        </div>
      </div>
    );
  }

  if (courses.length === 0 || !courseId) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <header className="border-b pb-7">
          <p className="text-sm font-medium text-muted-foreground">Competition</p>
          <h1 className="mt-1 text-[32px] leading-tight tracking-[-0.035em] sm:text-[40px]">Leaderboard</h1>
        </header>
        <div className="mt-10 rounded-2xl border bg-card px-6 py-12 text-center">
          <Trophy className="mx-auto size-10 text-muted-foreground" aria-hidden />
          <h2 className="mt-4 text-xl tracking-[-0.02em]">Join a course first</h2>
          <p className="mx-auto mt-2 max-w-md text-base text-muted-foreground">
            Weekly boards are per course. Enroll in a course, then come back to see how your week compares.
          </p>
          <Link href="/catalog" className={cn(buttonVariants(), "mt-6")}>
            Browse courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="border-b pb-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Competition</p>
            <h1 className="mt-1 text-[32px] leading-tight tracking-[-0.035em] sm:text-[40px]">Leaderboard</h1>
            <p className="mt-2 max-w-xl text-base text-muted-foreground">
              A weekly XP race with classmates who joined. Boards reset every Monday.
            </p>
          </div>
          <InfoTip label="About leaderboards" className="mt-1 shrink-0">
            <p>One board per course, shared with classmates who learn it the same way you do, ranked by XP earned in that course this week.</p>
            <p className="mt-2">Only learners who join appear, shown by first name and last initial. Boards reset every Monday at 00:00 UTC.</p>
          </InfoTip>
        </div>

        {courses.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={pending}
              aria-label={`Course: ${courseTitle}`}
              className="mt-6 flex min-h-11 w-full max-w-md items-center gap-2 rounded-lg border border-input bg-background px-3 text-left text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              <span className="min-w-0 flex-1 truncate">{courseTitle}</span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-80 p-1.5">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Course</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={courseId} onValueChange={(next) => switchCourse(String(next))}>
                  {courses.map((course) => (
                    <DropdownMenuRadioItem key={course.courseId} value={course.courseId} className="min-h-11 py-2 pl-2 leading-5">
                      {course.title}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <p className="mt-4 text-sm font-medium text-foreground">{courseTitle}</p>
        )}
      </header>

      <div aria-busy={pending} className={cn("mt-8 space-y-5 transition-opacity duration-150 motion-reduce:transition-none", pending && "opacity-60")}>
        {!view || view.status === "disabled" ? (
          <div className="rounded-2xl border bg-card px-6 py-12 text-center">
            <Trophy className="mx-auto size-10 text-muted-foreground" aria-hidden />
            <h2 className="mt-4 text-xl tracking-[-0.02em]">No board for this course</h2>
            <p className="mx-auto mt-2 max-w-md text-base text-muted-foreground">Try another course, or check back after you start learning.</p>
          </div>
        ) : view.status === "opt_in_required" ? (
          <div className="rounded-2xl border bg-card px-6 py-10 text-center sm:px-10">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Trophy className="size-7" aria-hidden />
            </span>
            <h2 className="mt-5 text-2xl tracking-[-0.02em]">Join this week&apos;s board</h2>
            <p className="mx-auto mt-2 max-w-md text-base text-muted-foreground">
              See how your week compares with classmates. Only people who join can see the board, and you can leave any time.
            </p>
            <Button className="mt-6" size="lg" onClick={join} disabled={pending}>
              Join leaderboards
            </Button>
          </div>
        ) : view.status === "unavailable" ? (
          <div className="rounded-2xl border bg-card px-6 py-12 text-center">
            <Trophy className="mx-auto size-10 text-muted-foreground" aria-hidden />
            <h2 className="mt-4 text-xl tracking-[-0.02em]">Board unavailable</h2>
            <p className="mx-auto mt-2 max-w-md text-base text-muted-foreground">
              {view.reason === "organization_disabled"
                ? "Your organization has turned leaderboards off for this course."
                : "Leaderboards are available while your enrollment is active."}
            </p>
          </div>
        ) : (
          <>
            <section aria-labelledby="your-standing-heading" className="overflow-hidden rounded-2xl border bg-card">
              <div className="border-b bg-muted/40 px-5 py-4 sm:px-6">
                <p className="text-sm font-medium text-muted-foreground">Your place this week</p>
                <h2 id="your-standing-heading" className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-4xl font-bold tabular-nums tracking-[-0.04em] text-foreground sm:text-5xl">#{view.you.rank}</span>
                  <span className="text-base text-muted-foreground">of {view.groupSize} learners</span>
                </h2>
              </div>
              <div className="space-y-5 px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">XP this week</p>
                    <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-[-0.02em]">{numberFormat.format(view.you.xp)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                    {resetLabel(view.resetsAt)}
                  </p>
                </div>
                <BestWeek xp={view.you.xp} best={view.you.bestWeekXp} />
              </div>
            </section>

            <section aria-labelledby="ranking-heading" className="rounded-2xl border bg-card p-5 sm:p-6">
              <h2 id="ranking-heading" className="text-lg font-semibold tracking-[-0.02em]">Around you</h2>
              <p className="mt-1 text-sm text-muted-foreground">You and the classmates nearest your rank.</p>
              <ol className="mt-5 divide-y divide-border overflow-hidden rounded-xl border">
                {view.entries.map((entry) => (
                  <li
                    key={`${entry.rank}-${entry.name}`}
                    aria-current={entry.isYou ? "true" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-3.5 sm:px-4",
                      entry.isYou && "bg-primary/5"
                    )}
                  >
                    <RankBadge rank={entry.rank} highlight={entry.isYou} />
                    <span className={cn("min-w-0 flex-1 truncate text-base", entry.isYou ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                      {entry.isYou ? "You" : entry.name}
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
                      {numberFormat.format(entry.xp)} XP
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={leave}
                  disabled={pending}
                  className="rounded text-sm font-medium text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                >
                  Leave leaderboards
                </button>
              </div>
            </section>

            {view.lastWeek ? <LastWeekWinners winners={view.lastWeek.winners} /> : null}
          </>
        )}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
