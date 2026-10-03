"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleDashed, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markChapterComplete } from "@/server/actions/progress";
import { cn } from "@/lib/utils";
import { fireMiniConfetti } from "@/components/learn/mini-confetti";
import { playFeedbackSound } from "@/lib/sound-feedback";

export function ChapterCompletionStrip({
  chapterId,
  chapterComplete,
  canMarkComplete,
  checkpointsCompleted,
  checkpointsTotal,
  courseCompleted,
  courseTotal,
}: {
  chapterId: string;
  chapterComplete: boolean;
  canMarkComplete: boolean;
  checkpointsCompleted: number;
  checkpointsTotal: number;
  courseCompleted: number;
  courseTotal: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [celebrating, setCelebrating] = useState(false);
  const celebrationRef = useRef<HTMLDivElement>(null);

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
      playFeedbackSound("completion");
      setCelebrating(true);
      requestAnimationFrame(() => {
        if (celebrationRef.current) fireMiniConfetti(celebrationRef.current);
      });
      router.refresh();
    });
  }

  let statusLine: string;
  if (chapterComplete) {
    statusLine = "This lesson is complete — the next one is unlocked in the syllabus.";
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
          <span
            className="inline-flex h-10 w-full min-w-[11rem] cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-border bg-muted px-4 text-sm font-medium text-muted-foreground sm:w-auto"
            title={statusLine}
          >
            <CircleDashed className="size-4 shrink-0" aria-hidden />
            Complete checkpoints first
          </span>
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
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">You can continue when you’re ready. Small, verified steps add up.</p>
          <div className="mt-5 rounded-xl border border-border bg-muted/35 p-4">
            <div className="flex items-baseline justify-between gap-3"><span className="text-sm font-medium">Course progress</span><span className="text-sm font-semibold tabular-nums">{Math.min(courseTotal, courseCompleted + 1)}/{courseTotal}</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${courseTotal ? Math.round((Math.min(courseTotal, courseCompleted + 1) / courseTotal) * 100) : 0}%` }} /></div>
          </div>
          <Button type="button" className="mt-5 w-full rounded-md" onClick={() => setCelebrating(false)}>Keep going</Button>
        </div>
      </div>
    ) : null}
    </>
  );
}
