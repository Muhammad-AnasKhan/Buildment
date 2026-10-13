import { Router } from "express";
import * as courses from "../../controllers/courses.js";
import { optionalAuth } from "../../middlewares/authenticate.js";
import { validateParams } from "../../middlewares/validate.js";
import { courseSlugParams } from "../../validations/courses.js";

const router = Router();

router.get("/:courseSlug/continue", optionalAuth, validateParams(courseSlugParams), courses.continueChapter);

export default router;
