import { Router } from "express";
import * as courses from "../../controllers/courses.js";
import * as enrollments from "../../controllers/enrollments.js";
import { authenticate, optionalAuth } from "../../middlewares/authenticate.js";
import { requireVerified } from "../../middlewares/require-verified.js";
import { validateParams } from "../../middlewares/validate.js";
import { chapterPathParams, courseSlugParams } from "../../validations/courses.js";

const router = Router();

router.get("/:courseSlug/continue", optionalAuth, validateParams(courseSlugParams), courses.continueChapter);
router.get("/:courseSlug/overview", authenticate, requireVerified, validateParams(courseSlugParams), courses.overview);
router.get("/:courseSlug/chapters/:chapterSlug", authenticate, requireVerified, validateParams(chapterPathParams), courses.chapter);
router.get("/:courseSlug/checkout", authenticate, requireVerified, validateParams(courseSlugParams), enrollments.checkout);

export default router;
