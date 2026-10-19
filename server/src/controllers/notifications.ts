import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import * as notifications from "../services/notifications/service.js";
import { issueRealtimeTicket } from "../services/notifications/realtime-ticket.js";
import type { NotificationListQuery, NotificationPreferencesBody } from "../validations/notifications.js";

// GET /api/v1/notifications?limit=&cursor=&unreadOnly= — newest first
export async function list(req: Request, res: Response) {
  ok(res, await notifications.listNotifications(req.user!.id, req.query as unknown as NotificationListQuery));
}

// POST /api/v1/notifications/:notificationId/read
export async function markRead(req: Request, res: Response) {
  ok(res, await notifications.markNotificationRead(req.user!.id, req.params.notificationId as string));
}

// POST /api/v1/notifications/read-all
export async function markAllRead(req: Request, res: Response) {
  ok(res, await notifications.markAllNotificationsRead(req.user!.id));
}

// GET /api/v1/notifications/preferences
export async function getPreferences(req: Request, res: Response) {
  ok(res, await notifications.getNotificationPreferences(req.user!.id));
}

// PUT /api/v1/notifications/preferences
export async function updatePreferences(req: Request, res: Response) {
  ok(res, await notifications.updateNotificationPreferences(req.user!.id, req.body as NotificationPreferencesBody));
}

// POST /api/v1/notifications/realtime-ticket — short-lived credential for opening the SSE stream
export async function realtimeTicket(req: Request, res: Response) {
  ok(res, await issueRealtimeTicket(req.sessionToken!, req.user!.id));
}
