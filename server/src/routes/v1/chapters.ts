import { Router } from "express";
import * as chapters from "../../controllers/chapters.js";
import * as integrity from "../../controllers/integrity.js";
import { authenticate, optionalAuth } from "../../middlewares/authenticate.js";
import { requireVerified } from "../../middlewares/require-verified.js";
import { userRateLimit } from "../../middlewares/rate-limit.js";
import { validate, validateParams } from "../../middlewares/validate.js";
import {
  chapterParams,
  checklistItemBody,
  checklistItemParams,
  headingNoteBody,
  headingNoteParams,
  learningLogBody,
  quizSubmitBody,
} from "../../validations/chapters.js";

const router = Router();

router.post(
  "/:chapterId/quiz/submit",
  optionalAuth,
  validate({ params: chapterParams, body: quizSubmitBody }),
  userRateLimit({
    scope: "quiz-submit",
    max: 10,
    keyFrom: (req) => req.params.chapterId as string,
    message: "Too many quiz submissions. Please wait a moment.",
  }),
  chapters.submitQuiz
);

// Learner progress on a chapter: completion, checklist ticks, reflections, margin notes.
const learner = [authenticate, requireVerified] as const;
router.get("/:chapterId/quiz", ...learner, validateParams(chapterParams), chapters.quizState);
router.post("/:chapterId/integrity", ...learner, validateParams(chapterParams), integrity.openAttempt);
router.post("/:chapterId/complete", ...learner, validateParams(chapterParams), chapters.complete);
router.put("/:chapterId/checklist/:itemId", ...learner, validate({ params: checklistItemParams, body: checklistItemBody }), chapters.putChecklistItem);
router.put("/:chapterId/learning-log", ...learner, validate({ params: chapterParams, body: learningLogBody }), chapters.putLearningLog);
router.put("/:chapterId/notes/:headingId", ...learner, validate({ params: headingNoteParams, body: headingNoteBody }), chapters.putHeadingNote);

export default router;
