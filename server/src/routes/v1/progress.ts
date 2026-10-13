import { Router } from "express";
import * as progress from "../../controllers/progress.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { validateBody, validateQuery } from "../../middlewares/validate.js";
import { heartbeatBody, sessionBody, sessionQuery } from "../../validations/progress.js";

const router = Router();

router.use(authenticate);

router.post("/heartbeat", validateBody(heartbeatBody), progress.heartbeat);
router.get("/session", validateQuery(sessionQuery), progress.getSession);
router.post("/session", validateBody(sessionBody), progress.controlSession);

export default router;
