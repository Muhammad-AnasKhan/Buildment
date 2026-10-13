import { Router } from "express";
import authRoutes from "./auth.js";
import blockRoutes from "./blocks.js";
import chapterRoutes from "./chapters.js";
import courseRoutes from "./courses.js";
import progressRoutes from "./progress.js";
import jobRoutes from "./jobs.js";
import learnerRoutes from "./learner.js";

// First-party API, versioned. Everything here answers with the { success, data } envelope.
const router = Router();

router.use("/auth", authRoutes);
router.use("/blocks", blockRoutes);
router.use("/chapters", chapterRoutes);
router.use("/courses", courseRoutes);
router.use("/progress", progressRoutes);
router.use("/jobs", jobRoutes);
router.use("/learner", learnerRoutes);

export default router;
