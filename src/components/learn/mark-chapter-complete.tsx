"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markChapterComplete } from "@/server/actions/progress";
import { acknowledgeStreakMilestone } from "@/server/actions/weekly-goal";
import type { StreakMilestone } from "@/server/progress/streak";
import { cn } from "@/lib/utils";
import { firePartyPops } from "@/components/learn/party-pops";
import { ChapterCompleteCelebrationModal } from "@/components/learn/chapter-complete-celebration-modal";
import { scrollToNextCheckpoint } from "@/components/learn/checkpoint-marker";
import { playFeedback } from "@/lib/sound-feedback";

const MODAL_OPEN_DELAY_MS = 820;

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

type CelebrationPhase = "idle" | "burst" | "modal";

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
  const [celebrationPhase, setCelebrationPhase] = useState<CelebrationPhase>("idle");
  const [trackedComplete, setTrackedComplete] = useState(chapterComplete);
  const modalTimerRef = useRef<number | null>(null);

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function beginCelebration() {
    if (celebrationPhase !== "idle") return;
    setCelebrationPhase("burst");
  }

  if (chapterComplete !== trackedComplete) {
    setTrackedComplete(chapterComplete);
    if (chapterComplete) beginCelebration();
  }

  useEffect(() => {
    if (celebrationPhase !== "burst") return;

    const reduced = prefersReducedMotion();
    if (reduced) {
      playFeedback("completion");
      setCelebrationPhase("modal");
      if (streakMilestone) void acknowledgeStreakMilestone(streakMilestone);
      return;
    }

    firePartyPops({
      particleCount: 80,
      dualPoppers: true,
      withSound: true,
      soundEffect: "completion",
    });
    if (streakMilestone) void acknowledgeStreakMilestone(streakMilestone);

    modalTimerRef.current = window.setTimeout(() => {
      setCelebrationPhase("modal");
    }, MODAL_OPEN_DELAY_MS);

    return () => {
      if (modalTimerRef.current != null) {
        window.clearTimeout(modalTimerRef.current);
        modalTimerRef.current = null;
      }
    };
  }, [celebrationPhase, streakMilestone]);

  function closeCelebration() {
    if (modalTimerRef.current != null) {
      window.clearTimeout(modalTimerRef.current);
      modalTimerRef.current = null;
    }
    setCelebrationPhase("idle");
  }

  function onMark() {
    setError(null);
    startTransition(async () => {
      const result = await markChapterComplete({ chapterId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      beginCelebration();
      router.refresh();
    });
  }

  const remaining = Math.max(0, checkpointsTotal - checkpointsCompleted);
  const hasCheckpoints = checkpointsTotal > 0;

  let statusLine: string;
  if (chapterComplete) {
    statusLine = "This lesson is complete — the next one is unlocked in the syllabus.";
  } else if (reflectionPending) {
    statusLine =
      "Check every checklist item and answer the learning log. The next chapter stays locked until those are saved.";
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

      <ChapterCompleteCelebrationModal
        open={celebrationPhase === "modal"}
        onClose={closeCelebration}
        recap={recap}
        streakMilestone={streakMilestone}
        courseCompleted={courseCompleted}
        courseTotal={courseTotal}
        nextHref={nextHref}
        nextTitle={nextTitle}
      />
    </>
  );
}
