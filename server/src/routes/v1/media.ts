import { Router } from "express";
import * as media from "../../controllers/course-media.js";
import { optionalAuth } from "../../middlewares/authenticate.js";

const router = Router();

router.get("/courses/:courseId/:purpose/:filename", optionalAuth, media.read);

export default router;
