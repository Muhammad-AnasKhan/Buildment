"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import type { NotificationItem } from "@/shared/api/notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/components/notifications/notification-center";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/notifications/notification-store";
import { formatRelativeTime } from "@/lib/notifications/format-relative-time";
import { cn } from "@/lib/utils";

const PREVIEW_COUNT = 8;

/** Bell with unread count and a dropdown of the newest notifications. Needs a mounted NotificationCenter. */
export function NotificationBell({ className }: { className?: string }) {
  const router = useRouter();
  const { items, unreadCount, status } = useNotifications();
  const preview = items.slice(0, PREVIEW_COUNT);

  const open = (item: NotificationItem) => {
    void markNotificationRead(item.id);
    if (item.url) router.push(item.url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              "relative grid size-9 shrink-0 place-items-center rounded-lg border bg-card text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
              className
            )}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
          />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-foreground px-1 py-0.5 text-center text-[10px] font-semibold leading-none tabular-nums text-background ring-2 ring-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void markAllNotificationsRead()}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator className="my-0" />

        <div className="max-h-[min(26rem,60dvh)] overflow-y-auto p-1">
          {preview.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {status === "error" ? "Notifications could not be loaded." : status === "ready" ? "You're all caught up." : "Loading…"}
            </p>
          ) : (
            preview.map((item) => (
              <DropdownMenuItem key={item.id} onClick={() => open(item)} className="items-start gap-2.5 px-2.5 py-2">
                <span
                  aria-hidden
                  className={cn("mt-1.5 size-2 shrink-0 rounded-full", item.readAt ? "bg-transparent" : "bg-primary")}
                />
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-sm", item.readAt ? "text-muted-foreground" : "font-medium text-foreground")}>
                    {item.title}
                  </span>
                  {item.body ? (
                    <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-muted-foreground">{item.body}</span>
                  ) : null}
                </span>
                <span className="shrink-0 pt-0.5 text-[11px] tabular-nums text-muted-foreground">
                  {formatRelativeTime(item.createdAt)}
                </span>
                {item.readAt ? null : <span className="sr-only">Unread</span>}
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="my-0" />
        <Link
          href="/notifications"
          className="block px-3 py-2.5 text-center text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted"
        >
          See all and notification settings
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
