import { CheckCircle2 } from "lucide-react";

export function CheckpointHeaderLabel({
  completed,
  total,
  chapterComplete,
}: {
  completed: number;
  total: number;
  chapterComplete: boolean;
}) {
  if (total === 0) return null;

  if (chapterComplete) {
    return (
      <span className="hidden h-7 shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 md:inline-flex">
        <CheckCircle2 className="size-3.5" aria-hidden />
        Complete
      </span>
    );
  }

  return (
    <span
      className="hidden h-7 shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 text-xs text-muted-foreground md:inline-flex"
      aria-label={`${completed} of ${total} checkpoints done`}
    >
      <span className="flex gap-0.5" aria-hidden>
        {Array.from({ length: Math.min(total, 6) }, (_, index) => (
          <span
            key={index}
            className={
              index < completed
                ? "size-1.5 rounded-full bg-emerald-500"
                : "size-1.5 rounded-full bg-muted-foreground/30"
            }
          />
        ))}
      </span>
      <span className="font-mono tabular-nums">
        {completed}/{total}
      </span>
      <span className="hidden lg:inline">checkpoints</span>
    </span>
  );
}
