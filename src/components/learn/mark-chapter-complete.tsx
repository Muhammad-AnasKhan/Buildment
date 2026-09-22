"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markChapterComplete } from "@/server/actions/progress";
import { cn } from "@/lib/utils";

export function ChapterCompletionStrip({
  chapterId,
  chapterComplete,
  canMarkComplete,
  checkpointsCompleted,
  checkpointsTotal,
}: {
  chapterId: string;
  chapterComplete: boolean;
  canMarkComplete: boolean;
  checkpointsCompleted: number;
  checkpointsTotal: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
          Finish this lesson
        </p>
        <p
          className={cn(
            "mt-1 text-sm leading-relaxed",
            chapterComplete ? "font-medium text-emerald-800" : "text-neutral-600"
          )}
        >
          {statusLine}
        </p>
        {hasCheckpoints && !chapterComplete ? (
          <p className="mt-1 font-mono text-xs tabular-nums text-neutral-400">
            {checkpointsCompleted}/{checkpointsTotal} checkpoints
          </p>
        ) : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="shrink-0 sm:pl-4">
        {chapterComplete ? (
          <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="size-4" aria-hidden />
            Completed
          </span>
        ) : canMarkComplete ? (
          <Button
            type="button"
            size="sm"
            onClick={onMark}
            disabled={pending}
            className="h-10 w-full min-w-[11rem] rounded-lg bg-neutral-950 px-5 text-sm font-medium text-white hover:bg-neutral-800 sm:w-auto"
          >
            {pending ? "Saving…" : "Mark chapter complete"}
          </Button>
        ) : (
          <span
            className="inline-flex h-10 w-full min-w-[11rem] cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-4 text-sm font-medium text-neutral-500 sm:w-auto"
            title={statusLine}
          >
            <CircleDashed className="size-4 shrink-0" aria-hidden />
            Complete checkpoints first
          </span>
        )}
      </div>
    </div>
  );
}
