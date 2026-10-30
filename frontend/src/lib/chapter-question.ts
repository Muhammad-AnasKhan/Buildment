// Rules for the "Ask about this chapter" box, mirrored from the API so the button and counter agree with it.

/** What the API returns; the server declares the same shapes in services/ai/chapter-qa/types.ts. */
export type ChapterQuestionStatus = { available: boolean; remaining: number; dailyLimit: number };
export type ChapterQuestionAnswer = { answer: string; remaining: number; dailyLimit: number };

export const QUESTION_MIN = 3;
export const QUESTION_MAX = 500;

export function isAskable(text: string): boolean {
  const length = text.trim().length;
  return length >= QUESTION_MIN && length <= QUESTION_MAX;
}

export function remainingLabel(remaining: number, dailyLimit: number): string {
  if (remaining <= 0) return `No questions left today (${dailyLimit} a day)`;
  return `${remaining} of ${dailyLimit} questions left today`;
}
