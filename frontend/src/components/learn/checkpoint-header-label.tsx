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
      <span className="hidden shrink-0 text-xs font-medium text-emerald-600 dark:text-emerald-400 sm:inline">
        Complete
      </span>
    );
  }

  return (
    <span className="hidden shrink-0 font-mono text-xs tabular-nums text-muted-foreground sm:inline">
      {completed}/{total} checkpoints
    </span>
  );
}
