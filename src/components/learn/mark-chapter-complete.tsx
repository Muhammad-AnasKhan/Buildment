"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Sparkles, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { markChapterComplete } from "@/server/actions/progress";
import { acknowledgeStreakMilestone } from "@/server/actions/weekly-goal";
import type { StreakMilestone } from "@/server/progress/streak";
import { cn } from "@/lib/utils";
import { fireMiniConfetti } from "@/components/learn/mini-confetti";
import { scrollToNextCheckpoint } from "@/components/learn/checkpoint-marker";
import { playFeedback } from "@/lib/sound-feedback";

export function ChapterCompletionStrip(props: {
  chapterId: string;
  chapterComplete: boolean;
  canMarkComplete: boolean;
  checkpointsCompleted: number;
  checkpointsTotal: number;
  nextHref?: string;
  nextTitle?: string;
  reflectionPending?: boolean;
  courseCompleted: number;
  courseTotal: number;
  recap?: { checks: string; open: string; next: string };
  streakMilestone?: StreakMilestone | null;
}) {
  return <ChapterCompletionMoment key={props.chapterId} {...props} />;
}

function ChapterCompletionMoment({
  chapterId,
  chapterComplete,
  canMarkComplete,
  checkpointsCompleted,
  checkpointsTotal,
  nextHref,
  nextTitle,
  reflectionPending = false,
  courseCompleted,
  courseTotal,
  recap,
  streakMilestone = null,
}: {
  chapterId: string;
  chapterComplete: boolean;
  canMarkComplete: boolean;
  checkpointsCompleted: number;
  checkpointsTotal: number;
  nextHref?: string;
  nextTitle?: string;
  reflectionPending?: boolean;
  courseCompleted: number;
  courseTotal: number;
  recap?: { checks: string; open: string; next: string };
  streakMilestone?: StreakMilestone | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [celebrating, setCelebrating] = useState(false);
  const [trackedComplete, setTrackedComplete] = useState(chapterComplete);
  const celebrationRef = useRef<HTMLDivElement>(null);

  if (chapterComplete !== trackedComplete) {
    setTrackedComplete(chapterComplete);
    if (chapterComplete) setCelebrating(true);
  }

  useEffect(() => {
    if (!celebrating || !celebrationRef.current) return;
    playFeedback("completion");
    fireMiniConfetti(celebrationRef.current);
    if (streakMilestone) void acknowledgeStreakMilestone(streakMilestone);
  }, [celebrating, streakMilestone]);

  const remaining = Math.max(0, checkpointsTotal - checkpointsCompleted);
  const hasCheckpoints = checkpointsTotal > 0;

  function onMark() {
    setError(null);
    startTransition(async () => {
      const result = await markChapterComplete({ chapterId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCelebrating(true);
      router.refresh();
    });
  }

  let statusLine: string;
  if (chapterComplete) {
    statusLine = "This lesson is complete — the next one is unlocked in the syllabus.";
  } else if (reflectionPending) {
    statusLine = "Check every checklist item and answer the learning log. The next chapter stays locked until those are saved.";
  } else if (canMarkComplete) {
    statusLine = hasCheckpoints
      ? "All checkpoints are done. Mark complete to unlock the next lesson."
      : "No graded checkpoints here — mark complete when you have read the lesson.";
  } else if (hasCheckpoints) {
    statusLine = `Finish ${remaining} more checkpoint${remaining === 1 ? "" : "s"} in this lesson (scroll up).`;
  } else {
    statusLine = "Mark complete when you are ready to move on.";
  }

  return (
    <>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Finish this lesson
        </p>
        <p
          className={cn(
            "mt-1 text-sm leading-relaxed",
            chapterComplete ? "font-medium text-emerald-800 dark:text-emerald-100" : "text-muted-foreground"
          )}
        >
          {statusLine}
        </p>
        {hasCheckpoints && !chapterComplete ? (
          <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground/75">
            {checkpointsCompleted}/{checkpointsTotal} checkpoints
          </p>
        ) : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="shrink-0 sm:pl-4">
        {chapterComplete ? (
          <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-100">
            <CheckCircle2 className="size-4 text-emerald-700 dark:text-emerald-400" aria-hidden />
            Completed
          </span>
        ) : reflectionPending ? (
          <span className="inline-flex h-10 w-full min-w-[11rem] items-center justify-center rounded-lg border border-border bg-muted px-4 text-sm font-medium text-muted-foreground sm:w-auto">
            Finish the gate reflection
          </span>
        ) : canMarkComplete ? (
          <Button
            type="button"
            size="sm"
            onClick={onMark}
            disabled={pending}
            className="h-10 w-full min-w-[11rem] rounded-lg px-5 text-sm font-medium sm:w-auto"
          >
            {pending ? "Saving…" : "Mark chapter complete"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={scrollToNextCheckpoint}
            className="h-10 w-full min-w-[11rem] rounded-lg px-5 text-sm font-medium sm:w-auto"
          >
            Next checkpoint
          </Button>
        )}
      </div>
    </div>
    {celebrating ? (
      <div ref={celebrationRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/25 p-4" role="dialog" aria-modal="true" aria-labelledby="chapter-complete-title">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><Sparkles className="size-5" /></div>
            <button type="button" onClick={() => setCelebrating(false)} className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Close celebration"><X className="size-4" /></button>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Progress saved</p>
          <h2 id="chapter-complete-title" className="mt-1 text-xl font-semibold tracking-tight">Great work — chapter complete.</h2>
          {recap ? (
            <ul className="mt-3 space-y-1 text-sm leading-relaxed text-muted-foreground">
              <li>{recap.checks}</li>
              <li>{recap.open}</li>
              <li>{recap.next}</li>
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">You can continue when you’re ready. Small, verified steps add up.</p>
          )}
          {streakMilestone ? (
            <p className="mt-3 text-sm font-medium text-foreground">{streakMilestone}-day streak.</p>
          ) : null}
          <div className="mt-5 rounded-xl border border-border bg-muted/35 p-4">
            <div className="flex items-baseline justify-between gap-3"><span className="text-sm font-medium">Course progress</span><span className="text-sm font-semibold tabular-nums">{Math.min(courseTotal, courseCompleted + 1)}/{courseTotal}</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${courseTotal ? Math.round((Math.min(courseTotal, courseCompleted + 1) / courseTotal) * 100) : 0}%` }} /></div>
          </div>
          {nextHref ? (
            <Link href={nextHref} className={cn(buttonVariants(), "mt-5 w-full")}>
              {nextTitle ? `Continue to ${nextTitle}` : "Continue to the next lesson"}
              <ArrowRight data-icon="inline-end" />
            </Link>
          ) : (
            <Button type="button" className="mt-5 w-full rounded-md" onClick={() => setCelebrating(false)}>Keep going</Button>
          )}
        </div>
      </div>
    ) : null}
    </>
  );
}
