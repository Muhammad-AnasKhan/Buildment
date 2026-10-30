// Rules for the "Ask about this chapter" box, mirrored from the API so the button and counter agree with it.

/** What the API returns; the server declares the same shapes in services/ai/chapter-qa/types.ts. */
export type ChapterQuestionStatus = { available: boolean; remaining: number; dailyLimit: number; starters: string[] };
export type ChapterQuestionAnswer = { answer: string; remaining: number; dailyLimit: number };

/** One question with the answer it got. */
export type QaTurn = { question: string; answer: string };

export const QUESTION_MIN = 3;
export const QUESTION_MAX = 500;
/** The character counter appears once the question is this long. */
export const COUNTER_FROM = 400;
/** Questions and answers kept per chapter for the page session. */
export const HISTORY_MAX = 3;
export const STARTERS_MAX = 4;

/** A streamed answer ends with this character and a message when it fails after the first byte; the server writes the same one. */
export const STREAM_ERROR_MARK = "\u0000";

export function isAskable(text: string): boolean {
  const length = text.trim().length;
  return length >= QUESTION_MIN && length <= QUESTION_MAX;
}

export function showCounter(length: number): boolean {
  return length >= COUNTER_FROM;
}

export function remainingLabel(remaining: number, dailyLimit: number): string {
  if (remaining <= 0) return `No questions left today (${dailyLimit} a day)`;
  return `${remaining} of ${dailyLimit} questions left today`;
}

const HEADING_MAX = 60;
const SKIPPED_HEADINGS = /^(summary|recap|key takeaways?|next steps?|references?|further reading|checklist)$/i;
const FALLBACK_STARTERS = ["What is the main idea of this chapter?", "Can you give me a simple example?"];

/**
 * Two to four chips for the box. The course's own starters win; otherwise they come from the
 * chapter's headings, with plain questions filling in when a chapter has few of them.
 */
export function starterQuestions(courseStarters: readonly string[], headings: readonly { text: string }[]): string[] {
  const own = courseStarters.map((text) => text.trim()).filter(isAskable);
  if (own.length > 0) return own.slice(0, STARTERS_MAX);

  const fromHeadings: string[] = [];
  for (const { text } of headings) {
    const heading = text.replace(/[:.]+$/, "").trim();
    if (!heading || heading.length > HEADING_MAX || SKIPPED_HEADINGS.test(heading)) continue;
    const question = heading.endsWith("?") ? heading : `What does ${heading} mean?`;
    if (!fromHeadings.includes(question)) fromHeadings.push(question);
    if (fromHeadings.length === STARTERS_MAX - 1) break;
  }
  return [...fromHeadings, ...FALLBACK_STARTERS].slice(0, Math.max(2, Math.min(STARTERS_MAX, fromHeadings.length + 1)));
}

/** Newest first, and only the last HISTORY_MAX are kept. */
export function pushHistory(history: readonly QaTurn[], turn: QaTurn): QaTurn[] {
  return [turn, ...history].slice(0, HISTORY_MAX);
}

/** Separates the answer text from a failure message the server appended mid-stream. */
export function splitStreamed(text: string): { answer: string; failure: string | null } {
  const at = text.indexOf(STREAM_ERROR_MARK);
  if (at === -1) return { answer: text, failure: null };
  return { answer: text.slice(0, at), failure: text.slice(at + 1).trim() || null };
}

const GENERIC_FAILURE = "We could not answer that just now. Please try again in a moment.";

/**
 * What the learner reads when something goes wrong. Only wording this app or the API chose on purpose
 * gets through; a network error, a parse error or anything unexpected becomes the generic line.
 */
export function friendlyFailure(error: unknown): string {
  const { status, code, message } = (error ?? {}) as { status?: unknown; code?: unknown; message?: unknown };
  if (typeof status !== "number") return GENERIC_FAILURE;
  if (code === "QA_PAUSED") return "Questions are paused for today. Please try again tomorrow.";
  if (code === "QA_UNAVAILABLE") return "Questions are not available right now.";
  if (status === 429 && typeof message === "string") return message;
  if (status === 403 && code === "CHAPTER_LOCKED" && typeof message === "string") return message;
  if (status === 401) return "Sign in again to ask a question.";
  if (status === 400) return "That question could not be sent. Check it and try again.";
  return GENERIC_FAILURE;
}
