import { z } from "zod";
import { NOTIFICATION_CATEGORIES } from "../shared/api/notifications.js";
import { id } from "./common.js";

export const notificationListQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: id.optional(),
  unreadOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});
export type NotificationListQuery = z.infer<typeof notificationListQuery>;

export const notificationIdParams = z.object({ notificationId: id });

const channelSwitches = z.partialRecord(z.enum(NOTIFICATION_CATEGORIES), z.boolean());

export const notificationPreferencesBody = z
  .object({ email: channelSwitches.optional(), inApp: channelSwitches.optional() })
  .strict();
export type NotificationPreferencesBody = z.infer<typeof notificationPreferencesBody>;
