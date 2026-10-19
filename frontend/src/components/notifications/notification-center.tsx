"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { NotificationItem } from "@/shared/api/notifications";
import {
  acquireNotificationCenter,
  getNotificationState,
  getServerNotificationState,
  onNotificationToast,
  subscribeNotifications,
} from "@/lib/notifications/notification-store";
import { toast } from "@/components/ui/app-toast";

const showToast = (item: NotificationItem) => toast(item.body, "info", { title: item.title, href: item.url });

// However many centers are mounted, one toast listener exists, so a notification toasts once.
let toastHolders = 0;
let stopToasts: (() => void) | null = null;

/**
 * Keeps the signed-in user's notification feed and live connection running for this tab and turns
 * new notifications into toasts. Renders nothing; safe to mount in several layouts.
 */
export function NotificationCenter() {
  useEffect(() => {
    const release = acquireNotificationCenter();
    toastHolders += 1;
    stopToasts ??= onNotificationToast(showToast);
    return () => {
      toastHolders -= 1;
      if (toastHolders === 0) {
        stopToasts?.();
        stopToasts = null;
      }
      release();
    };
  }, []);
  return null;
}

export function useNotifications() {
  return useSyncExternalStore(subscribeNotifications, getNotificationState, getServerNotificationState);
}
