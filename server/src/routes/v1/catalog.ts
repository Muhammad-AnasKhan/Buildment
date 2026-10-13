import { Router } from "express";
import * as catalog from "../../controllers/catalog.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireVerified } from "../../middlewares/require-verified.js";
import { validateParams } from "../../middlewares/validate.js";
import { courseSlugParams } from "../../validations/courses.js";

const router = Router();

router.use(authenticate, requireVerified);

router.get("/", catalog.list);
router.get("/:courseSlug", validateParams(courseSlugParams), catalog.detail);

export default router;
