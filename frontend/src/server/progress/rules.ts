import type { BlockType, ProgressStatus, ResponseStatus } from "@/generated/prisma/client";

// Completion math for chapter progress and sequential gating.
// Presentational blocks never receive a Response, so counting them as required
// work makes a chapter impossible to complete (the bug that kept course % at 0).

export const COMPLETABLE_BLOCK_TYPES = new Set<BlockType>([
  "QUIZ",
  "TEST",
  "MUST_READ",
  "OPEN_QUESTION",
  "CODE",
  "PREDICT",
]);

export type BlockForProgress = {
  type: BlockType;
  required: boolean;
  archivedAt?: Date | null;
};

export function isCompletableBlock(block: BlockForProgress): boolean {
  return !block.archivedAt && block.required && COMPLETABLE_BLOCK_TYPES.has(block.type);
}

export function isCompleteResponseStatus(status: ResponseStatus | string): boolean {
  return status !== "DRAFT";
}

const SCORED_CHECKPOINT_TYPES = new Set<BlockType>(["QUIZ", "PREDICT", "CODE"]);

/** Missing or unreadable config keeps retries open, so a wrong answer does not finish the checkpoint. */
export function allowRetryFromConfig(config: unknown): boolean {
  if (!config || typeof config !== "object") return true;
  return (config as { allowRetry?: unknown }).allowRetry !== false;
}

/**
 * Open questions and required reads count once submitted.
 * Quiz, predict, and code count when the answer is correct, or when retry is off and the attempt is in.
 */
export function checkpointSatisfied(args: {
  type: BlockType;
  config: unknown;
  status: ResponseStatus | string | null;
  isCorrect: boolean | null;
}): boolean {
  if (!args.status || !isCompleteResponseStatus(args.status)) return false;
  if (!SCORED_CHECKPOINT_TYPES.has(args.type)) return true;
  if (args.isCorrect === true) return true;
  return !allowRetryFromConfig(args.config);
}

export function chapterProgressStatus(args: {
  completableTotal: number;
  completableCompleted: number;
  markedComplete: boolean;
  visited: boolean;
  /** Module-gate chapter whose checklist or learning log is still unfinished. */
  reflectionBlocked?: boolean;
}): ProgressStatus {
  if (args.completableTotal === 0) {
    if (args.markedComplete && !args.reflectionBlocked) return "COMPLETED";
    if (args.visited || args.markedComplete) return "IN_PROGRESS";
    return "NOT_STARTED";
  }
  if (args.completableCompleted >= args.completableTotal) {
    if (args.reflectionBlocked) return "IN_PROGRESS";
    return "COMPLETED";
  }
  if (args.completableCompleted > 0 || args.visited) return "IN_PROGRESS";
  return "NOT_STARTED";
}

export function flattenChapterIds<
  TModule extends { order: number; chapters: Array<{ id: string; order: number }> },
>(modules: TModule[]): string[] {
  return modules
    .slice()
    .sort((a, b) => a.order - b.order)
    .flatMap((mod) =>
      mod.chapters.slice().sort((a, b) => a.order - b.order).map((chapter) => chapter.id)
    );
}

/** Chapter N+1 is locked until every earlier chapter is COMPLETED. First chapter is always open. */
export function lockedChapterIds(
  orderedIds: string[],
  progressById: Map<string, ProgressStatus>,
  sequential: boolean
): Set<string> {
  const locked = new Set<string>();
  if (!sequential || orderedIds.length < 2) return locked;

  for (let i = 1; i < orderedIds.length; i++) {
    const previousId = orderedIds[i - 1]!;
    const previousStatus = progressById.get(previousId) ?? "NOT_STARTED";
    if (previousStatus !== "COMPLETED") {
      for (let j = i; j < orderedIds.length; j++) {
        locked.add(orderedIds[j]!);
      }
      break;
    }
  }
  return locked;
}

export function previousChapterId(orderedIds: string[], chapterId: string): string | null {
  const index = orderedIds.indexOf(chapterId);
  if (index <= 0) return null;
  return orderedIds[index - 1] ?? null;
}
