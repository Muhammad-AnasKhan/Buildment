import { Router } from "express";
import * as learner from "../../controllers/learner.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireVerified } from "../../middlewares/require-verified.js";
import { validateBody, validateParams } from "../../middlewares/validate.js";
import { instructorAccessRequestBody, profileBody, streakMilestoneParams, weeklyGoalBody } from "../../validations/learner.js";

// Everything the signed-in learner sees about themselves.
const router = Router();

router.use(authenticate, requireVerified);

router.get("/workspace", learner.workspace);
router.get("/dashboard", learner.dashboard);
router.get("/progress", learner.progress);
router.put("/weekly-goal", validateBody(weeklyGoalBody), learner.putWeeklyGoal);
router.delete("/weekly-goal", learner.deleteWeeklyGoal);
router.post("/streak-milestones/:milestone/acknowledge", validateParams(streakMilestoneParams), learner.acknowledgeStreakMilestone);
router.get("/profile", learner.profile);
router.patch("/profile", validateBody(profileBody), learner.patchProfile);
router.post("/instructor-access-requests", validateBody(instructorAccessRequestBody), learner.requestInstructor);

export default router;
