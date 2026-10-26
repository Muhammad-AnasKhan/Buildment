import { Router } from "express";
import * as engagement from "../../controllers/engagement.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { userRateLimit } from "../../middlewares/rate-limit.js";
import { validateBody } from "../../middlewares/validate.js";
import { trackEventBody } from "../../validations/engagement.js";

// Engagement events from the signed-in app (docs/13-engagement.mdx). A learner produces a handful
// per minute at most; the limit stops a client loop without getting in the way of real use.
const router = Router();

router.use(authenticate);

router.post("/", userRateLimit({ scope: "engagement-events", max: 30 }), validateBody(trackEventBody), engagement.track);

export default router;
