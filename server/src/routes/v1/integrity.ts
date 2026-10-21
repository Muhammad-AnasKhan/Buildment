import { raw, Router } from "express";
import * as integrity from "../../controllers/integrity.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { userRateLimit } from "../../middlewares/rate-limit.js";
import { validate, validateParams } from "../../middlewares/validate.js";
import { INTEGRITY_LIMITS } from "../../shared/api/integrity.js";
import { attemptParams, integrityCameraBody, integrityEventsBody } from "../../validations/integrity.js";

// Learner-side quiz integrity signals. The browser treats every failure here as
// non-fatal: a flaky connection must never block a quiz.
const router = Router();

router.use(authenticate);

router.post(
  "/attempts/:attemptId/events",
  validate({ params: attemptParams, body: integrityEventsBody }),
  userRateLimit({ scope: "integrity-events", max: 30, keyFrom: (req) => req.params.attemptId as string, message: "Too many integrity reports." }),
  integrity.recordEvents
);
router.put("/attempts/:attemptId/camera", validate({ params: attemptParams, body: integrityCameraBody }), integrity.setCamera);
router.post(
  "/attempts/:attemptId/snapshots",
  validateParams(attemptParams),
  userRateLimit({ scope: "integrity-snapshot", max: 6, keyFrom: (req) => req.params.attemptId as string, message: "Snapshot skipped." }),
  raw({ type: "image/jpeg", limit: INTEGRITY_LIMITS.snapshotMaxBytes }),
  integrity.uploadSnapshot
);

export default router;
