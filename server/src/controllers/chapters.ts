import type { Request, Response } from "express";
import { noContent, ok } from "../utils/responses.js";
import { submitChapterQuiz } from "../services/chapters/quiz-submit.js";
import { markChapterComplete } from "../services/progress/chapter-completion.js";
import { saveChecklistItem, saveLearningLogAnswers } from "../services/progress/learning-log.js";
import { saveHeadingNote } from "../services/chapters/heading-notes.js";
import { loadQuizChapterState } from "../services/chapters/quiz-state.js";
import { askAboutChapter, chapterQuestionStatus } from "../services/ai/chapter-qa/service.js";
import type { AskChapterBody, QuizSubmitBody } from "../validations/chapters.js";

// POST /api/v1/chapters/:chapterId/quiz/submit
export async function submitQuiz(req: Request, res: Response) {
  const { answers } = req.body as QuizSubmitBody;
  const result = await submitChapterQuiz({ chapterId: req.params.chapterId as string, user: req.user, answers });
  ok(res, result);
}

// POST /api/v1/chapters/:chapterId/complete
export async function complete(req: Request, res: Response) {
  await markChapterComplete(req.params.chapterId as string, req.user!);
  noContent(res);
}

// PUT /api/v1/chapters/:chapterId/checklist/:itemId
export async function putChecklistItem(req: Request, res: Response) {
  const { chapterId, itemId } = req.params as { chapterId: string; itemId: string };
  const { checked } = req.body as { checked: boolean };
  await saveChecklistItem(req.user!, { chapterId, itemId, checked });
  noContent(res);
}

// PUT /api/v1/chapters/:chapterId/learning-log
export async function putLearningLog(req: Request, res: Response) {
  const { answers } = req.body as { answers: Record<string, string> };
  ok(res, await saveLearningLogAnswers(req.user!, { chapterId: req.params.chapterId as string, answers }));
}

// PUT /api/v1/chapters/:chapterId/notes/:headingId
export async function putHeadingNote(req: Request, res: Response) {
  const { chapterId, headingId } = req.params as { chapterId: string; headingId: string };
  const { body } = req.body as { body: string };
  ok(res, await saveHeadingNote(req.user!, { chapterId, headingId, body }));
}

// GET /api/v1/chapters/:chapterId/quiz
export async function quizState(req: Request, res: Response) {
  ok(res, await loadQuizChapterState(req.params.chapterId as string, req.user!.id));
}

// GET /api/v1/chapters/:chapterId/ask
export async function askStatus(req: Request, res: Response) {
  ok(res, await chapterQuestionStatus(req.params.chapterId as string, req.user));
}

// POST /api/v1/chapters/:chapterId/ask
export async function ask(req: Request, res: Response) {
  const { question } = req.body as AskChapterBody;
  ok(res, await askAboutChapter({ chapterId: req.params.chapterId as string, user: req.user, question }));
}
