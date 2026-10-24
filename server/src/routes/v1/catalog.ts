import { Router } from "express";
import * as catalog from "../../controllers/catalog.js";
import { optionalAuth } from "../../middlewares/authenticate.js";
import { validateParams } from "../../middlewares/validate.js";
import { courseSlugParams } from "../../validations/courses.js";

const router = Router();

// Published catalog summaries and curriculum outlines are public.
router.get("/", optionalAuth, catalog.list);
router.get("/:courseSlug", optionalAuth, validateParams(courseSlugParams), catalog.detail);

export default router;
