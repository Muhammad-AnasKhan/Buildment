import { Router } from "express";
import * as jobs from "../../controllers/jobs.js";
import { requireCronSecret } from "../../middlewares/require-cron-secret.js";

const router = Router();

router.use(requireCronSecret);

router.post("/inactivity-nudge", jobs.inactivityNudge);
router.post("/weekly-goal-reminder", jobs.weeklyGoalReminder);
router.post("/integrity-retention", jobs.integrityRetention);

export default router;
