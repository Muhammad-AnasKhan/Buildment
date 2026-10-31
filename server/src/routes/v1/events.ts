import { Router } from "express";
import * as events from "../../controllers/events.js";
import { authenticate } from "../../middlewares/authenticate.js";

// One long-lived Server-Sent-Events stream per browser tab: live chat messages,
// delivery/seen receipts and notifications are pushed here instead of polled.
const router = Router();

router.get("/stream", authenticate, events.stream);

export default router;
