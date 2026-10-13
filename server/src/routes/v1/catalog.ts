import { Router } from "express";
import * as catalog from "../../controllers/catalog.js";
import { authenticate, optionalAuth } from "../../middlewares/authenticate.js";
import { requireVerified } from "../../middlewares/require-verified.js";
import { validateParams } from "../../middlewares/validate.js";
import { courseSlugParams } from "../../validations/courses.js";

const router = Router();

// The list is public (the landing page shows it); the detail needs a verified account.
router.get("/", optionalAuth, catalog.list);
router.get("/:courseSlug", authenticate, requireVerified, validateParams(courseSlugParams), catalog.detail);

export default router;
