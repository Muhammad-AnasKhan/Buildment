import { Router } from "express";
import * as activity from "../../controllers/activity.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { userRateLimit } from "../../middlewares/rate-limit.js";
import { validateBody } from "../../middlewares/validate.js";
import { appHeartbeatBody } from "../../validations/activity.js";

// Overall app activity from the signed-in browser. One tab beats about once a minute plus a flush
// when it is hidden; the limit leaves room for a few tabs without letting a loop hammer the DB.
const router = Router();

router.use(authenticate);

router.post(
  "/heartbeat",
  userRateLimit({ scope: "app-activity", max: 12 }),
  validateBody(appHeartbeatBody),
  activity.heartbeat
);

export default router;
