import { Router } from "express";
import * as jobs from "../../controllers/jobs.js";
import { requireCronSecret } from "../../middlewares/require-cron-secret.js";

const router = Router();

router.use(requireCronSecret);

router.post("/study-reminders", jobs.studyReminders);
/** Kept so existing external schedulers keep working; same job as /study-reminders. */
router.post("/inactivity-nudge", jobs.studyReminders);
router.post("/notification-emails", jobs.notificationEmails);
router.post("/app-activity-cleanup", jobs.appActivityCleanup);
router.post("/weekly-goal-reminder", jobs.weeklyGoalReminder);
router.post("/integrity-retention", jobs.integrityRetention);

export default router;
