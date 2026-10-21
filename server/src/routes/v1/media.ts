import { Router } from "express";
import * as media from "../../controllers/course-media.js";
import * as integrity from "../../controllers/integrity.js";
import { optionalAuth } from "../../middlewares/authenticate.js";
import { validateParams } from "../../middlewares/validate.js";
import { snapshotFileParams } from "../../validations/integrity.js";

const router = Router();

router.get("/courses/:courseId/:purpose/:filename", optionalAuth, media.read);
// Quiz snapshots: the signed, short-lived query string is the credential.
router.get("/integrity/:file", validateParams(snapshotFileParams), integrity.readSnapshot);

export default router;
