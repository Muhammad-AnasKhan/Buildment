import type { ResponseStatus, ReviewVerdict } from "../domain/enums.js";
import type { SanitizedCodeConfig } from "../blocks/code/schema.js";
import type { SanitizedOpenQuestionConfig } from "../blocks/open-question/schema.js";
import type { SanitizedPredictConfig } from "../blocks/predict/schema.js";
import type { SanitizedQuizConfig } from "../blocks/quiz/schema.js";
import type { OpenQuestionGroupPosition } from "../blocks/open-question/group-position.js";

// Wire contract for GET /api/v1/blocks/:blockId/state: the client-safe config plus
// the caller's latest answer, shaped for each block's client component.

export type QuizBlockState = {
  type: "QUIZ";
  config: SanitizedQuizConfig;
  initialState: { selected: string[]; isCorrect: boolean | null; score: number | null; maxScore: number | null; explanation?: string } | null;
};

export type PredictBlockState = {
  type: "PREDICT";
  config: SanitizedPredictConfig;
  initialState: { selected: string; isCorrect: boolean | null; score: number | null; maxScore: number | null; explanation?: string } | null;
};

export type CodeBlockState = {
  type: "CODE";
  config: SanitizedCodeConfig;
  initialState: { source: string; isCorrect: boolean | null } | null;
};

export type OpenQuestionBlockState = {
  type: "OPEN_QUESTION";
  config: SanitizedOpenQuestionConfig;
  group: { position: OpenQuestionGroupPosition; index: number; total: number };
  initialState: {
    status: ResponseStatus;
    attempt: number;
    text: string;
    url: string | null;
    feedback: string | null;
    verdict: ReviewVerdict | null;
  } | null;
};

export type MustReadBlockState = {
  type: "MUST_READ";
  config: { title: string; url: string; description: string; source?: string; readMinutes?: number };
  initialRead: boolean;
};

export type BlockState = QuizBlockState | PredictBlockState | CodeBlockState | OpenQuestionBlockState | MustReadBlockState;

/** Quiz-mode chapter: every question's last answer, for the wizard's initial state. */
export type QuizChapterState = {
  blockIds: string[];
  initialAnswers: Record<string, string[]>;
  initialBlockGrades: Record<string, { selected: string[]; isCorrect: boolean | null; explanation?: string }>;
  initialScoreSummary: { score: number; maxScore: number; questions: number } | null;
};
