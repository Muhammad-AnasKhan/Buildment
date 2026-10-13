import { Router } from "express";
import * as chapters from "../../controllers/chapters.js";
import { optionalAuth } from "../../middlewares/authenticate.js";
import { userRateLimit } from "../../middlewares/rate-limit.js";
import { validate } from "../../middlewares/validate.js";
import { chapterParams, quizSubmitBody } from "../../validations/chapters.js";

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

export default router;
