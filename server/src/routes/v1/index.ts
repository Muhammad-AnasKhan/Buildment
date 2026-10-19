import { Router } from "express";
import authRoutes from "./auth.js";
import blockRoutes from "./blocks.js";
import chapterRoutes from "./chapters.js";
import courseRoutes from "./courses.js";
import progressRoutes from "./progress.js";
import jobRoutes from "./jobs.js";
import learnerRoutes from "./learner.js";
import catalogRoutes from "./catalog.js";
import enrollmentRoutes from "./enrollments.js";
import helpRoutes from "./help.js";
import inviteRoutes from "./invites.js";
import teachRoutes from "./teach.js";
import mediaRoutes from "./media.js";
import adminRoutes from "./admin.js";
import integrityRoutes from "./integrity.js";
import activityRoutes from "./activity.js";
import notificationRoutes from "./notifications.js";

// First-party API, versioned. JSON routes use the { success, data } envelope;
// the media route streams image bytes.
const router = Router();

router.use("/auth", authRoutes);
router.use("/blocks", blockRoutes);
router.use("/chapters", chapterRoutes);
router.use("/courses", courseRoutes);
router.use("/progress", progressRoutes);
router.use("/jobs", jobRoutes);
router.use("/learner", learnerRoutes);
router.use("/catalog", catalogRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/help", helpRoutes);
router.use("/invites", inviteRoutes);
router.use("/teach", teachRoutes);
router.use("/media", mediaRoutes);
router.use("/admin", adminRoutes);
router.use("/integrity", integrityRoutes);
router.use("/activity", activityRoutes);
router.use("/notifications", notificationRoutes);

export default router;
