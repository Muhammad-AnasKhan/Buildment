export type ChapterRecapResponse = {
  status: string;
  isCorrect: boolean | null;
};

export function chapterChecksLine(completed: number, total: number): string {
  if (total <= 0) return "No graded checks in this lesson.";
  return `${completed} of ${total} checks passed.`;
}

export function chapterOpenLine(responses: ChapterRecapResponse[]): string {
  if (responses.some((response) => response.status === "NEEDS_REVISION")) {
    return "One response still needs a revision.";
  }
  if (responses.some((response) => response.status === "PENDING_REVIEW")) {
    return "One response is with your mentor.";
  }
  if (responses.some((response) => response.isCorrect === false)) {
    return "One answer is saved and cannot be retried.";
  }
  return "Every check is finished.";
}

export function chapterNextLine(nextTitle?: string): string {
  return nextTitle ? `Next: ${nextTitle}.` : "This is the last lesson in the course.";
}

export function latestChapterResponses<T extends ChapterRecapResponse & { blockId: string }>(responses: T[]): T[] {
  const byBlock = new Map<string, T>();
  for (const response of responses) {
    if (!byBlock.has(response.blockId)) byBlock.set(response.blockId, response);
  }
  return [...byBlock.values()];
}
