import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import { submitChapterQuiz } from "../services/chapters/quiz-submit.js";
import type { QuizSubmitBody } from "../validations/chapters.js";

// POST /api/v1/chapters/:chapterId/quiz/submit
export async function submitQuiz(req: Request, res: Response) {
  const { answers } = req.body as QuizSubmitBody;
  const result = await submitChapterQuiz({ chapterId: req.params.chapterId as string, user: req.user, answers });
  ok(res, result);
}
