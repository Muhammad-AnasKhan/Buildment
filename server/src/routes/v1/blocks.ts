import { Router } from "express";
import * as blocks from "../../controllers/blocks.js";
import { optionalAuth } from "../../middlewares/authenticate.js";
import { userRateLimit } from "../../middlewares/rate-limit.js";
import { validate } from "../../middlewares/validate.js";
import { respondBody, respondParams } from "../../validations/blocks.js";
import { validateParams } from "../../middlewares/validate.js";

const router = Router();

// optionalAuth, not authenticate: the service answers 404 for an unknown block
// before 401, which the quiz client relies on to fall back to local grading.
router.post(
  "/:blockId/respond",
  optionalAuth,
  validate({ params: respondParams, body: respondBody }),
  userRateLimit({
    scope: "respond",
    max: 40,
    keyFrom: (req) => req.params.blockId as string,
    message: "Too many submissions — wait a minute and try again.",
  }),
  blocks.respond
);

// Config + the caller's latest answer; anonymous callers get the config only.
router.get("/:blockId/state", optionalAuth, validateParams(respondParams), blocks.state);

export default router;
