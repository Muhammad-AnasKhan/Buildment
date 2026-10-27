import { Router } from "express";
import * as notifications from "../../controllers/notifications.js";
import { openNotificationStream } from "../../realtime/sse.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { userRateLimit } from "../../middlewares/rate-limit.js";
import { validate, validateBody, validateQuery } from "../../middlewares/validate.js";
import {
  notificationIdParams,
  notificationListQuery,
  notificationPreferencesBody,
} from "../../validations/notifications.js";

// The signed-in user's own notifications. Every query is scoped to req.user, so one user can never
// read or change another's. New notifications arrive live over Server-Sent Events (/stream);
// clients fetch this feed on load and after each reconnect instead of polling it.
const router = Router();

// Before `authenticate`: the stream also accepts a `?ticket=` (EventSource cannot send headers)
// and checks every credential itself.
router.get("/stream", openNotificationStream);

router.use(authenticate);

router.get("/", validateQuery(notificationListQuery), notifications.list);
router.post("/read-all", notifications.markAllRead);
router.get("/preferences", notifications.getPreferences);
router.put("/preferences", validateBody(notificationPreferencesBody), notifications.updatePreferences);
router.post(
  "/realtime-ticket",
  userRateLimit({ scope: "realtime-ticket", max: 30 }),
  notifications.realtimeTicket
);
router.post("/:notificationId/read", validate({ params: notificationIdParams }), notifications.markRead);

export default router;
