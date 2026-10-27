"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import {
  ArrowRight,
  Bell,
  BellRing,
  CalendarClock,
  Check,
  GraduationCap,
  Inbox,
  MessageSquareText,
  Settings,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import type { NotificationCategory, NotificationItem, NotificationType } from "@/shared/api/notifications";
import { Button, buttonVariants } from "@/components/ui/button";
import { useNotifications } from "@/components/notifications/notification-center";
import {
  loadMoreNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  refreshNotifications,
} from "@/lib/notifications/notification-store";
import { formatRelativeTime } from "@/lib/notifications/format-relative-time";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<NotificationCategory, LucideIcon> = {
  activity: MessageSquareText,
  course: GraduationCap,
  reminder: CalendarClock,
  account: ShieldCheck,
  admin: Inbox,
};

/** Label for the link under each notification (where clicking it goes). */
const ACTION_LABEL: Partial<Record<NotificationType, string>> = {
  "help.question": "View question",
  "help.reply": "View reply",
  "help.resolved": "View question",
  "review.pending": "Review submission",
  "review.feedback": "View feedback",
  "enrollment.created": "Open course",
  "enrollment.new_learner": "View learners",
  "course.completed": "What's next",
  "course.learner_completed": "View learners",
  "study.reminder": "Continue learning",
  "course.suggestion": "View course",
  "instructor.request": "Review request",
  "organization.course_request": "Review request",
};

type Filter = "all" | "unread";

const iconButton =
  "grid size-9 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Bell with unread count. Opens a drawer from the right with the user's notifications: All/Unread
 * tabs, mark read per item or all at once, and older pages on demand. Needs a mounted
 * NotificationCenter (it reads the shared, live-updated feed).
 */
export function NotificationBell({ className }: { className?: string }) {
  const router = useRouter();
  const { items, unreadCount, status, nextCursor, loadingMore } = useNotifications();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const visible = filter === "unread" ? items.filter((item) => !item.readAt) : items;
  const unreadLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  const select = (item: NotificationItem) => {
    void markNotificationRead(item.id);
    if (item.url) {
      setOpen(false);
      router.push(item.url);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={cn(
          "relative grid size-9 shrink-0 place-items-center rounded-lg border bg-card text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted data-popup-open:text-foreground",
          className
        )}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none tabular-nums text-primary-foreground ring-2 ring-background">
            {unreadLabel}
          </span>
        ) : null}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l bg-background text-foreground shadow-2xl outline-none transition-transform duration-300 ease-out data-ending-style:translate-x-full data-starting-style:translate-x-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b px-5 pb-4 pt-5 sm:px-6">
            <div className="min-w-0">
              <Dialog.Title className="text-lg font-semibold tracking-tight">Notifications</Dialog.Title>
              <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
              </Dialog.Description>
            </div>
            <div className="-mr-2 flex items-center gap-0.5">
              <Link
                href="/notifications#notification-settings"
                onClick={() => setOpen(false)}
                aria-label="Notification settings"
                title="Notification settings"
                className={iconButton}
              >
                <Settings className="size-4" />
              </Link>
              <Dialog.Close aria-label="Close notifications" className={iconButton}>
                <X className="size-4.5" />
              </Dialog.Close>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b px-5 py-3 sm:px-6" role="tablist" aria-label="Filter notifications">
            {(
              [
                { value: "all", label: "All updates" },
                { value: "unread", label: unreadCount > 0 ? `Unread (${unreadLabel})` : "Unread" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={filter === tab.value}
                onClick={() => setFilter(tab.value)}
                className={cn(
                  "h-8 rounded-full px-3.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  filter === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted/30 p-3 sm:p-4">
            {visible.length > 0 ? (
              <ul className="space-y-2">
                {visible.map((item) => (
                  <li key={item.id}>
                    <NotificationCard item={item} onSelect={() => select(item)} />
                  </li>
                ))}
              </ul>
            ) : status === "error" ? (
              <EmptyState
                icon={Bell}
                title="Couldn't load notifications"
                description="Check your connection and try again."
                action={
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => void refreshNotifications()}>
                    Try again
                  </Button>
                }
              />
            ) : status === "ready" ? (
              <EmptyState
                icon={BellRing}
                title={filter === "unread" ? "No unread notifications" : "You're all caught up"}
                description={
                  filter === "unread"
                    ? "Everything has been read. Switch to All updates to see older ones."
                    : "Replies, reviews and course updates will show up here."
                }
              />
            ) : (
              <LoadingCards />
            )}

            {nextCursor && visible.length > 0 ? (
              <div className="pt-3 text-center">
                <Button variant="ghost" size="sm" disabled={loadingMore} onClick={() => void loadMoreNotifications()}>
                  {loadingMore ? "Loading…" : "Load older"}
                </Button>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-3 border-t bg-background px-5 py-4 sm:px-6">
            <Button variant="secondary" disabled={unreadCount === 0} onClick={() => void markAllNotificationsRead()}>
              Mark all as read
            </Button>
            <Link href="/notifications" onClick={() => setOpen(false)} className={buttonVariants()}>
              View all
            </Link>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function NotificationCard({ item, onSelect }: { item: NotificationItem; onSelect: () => void }) {
  const Icon = CATEGORY_ICON[item.category] ?? Bell;
  const unread = !item.readAt;
  const action = item.url ? (ACTION_LABEL[item.type] ?? "Open") : null;

  return (
    <div
      className={cn(
        "group relative flex gap-3 rounded-xl border p-3.5 transition-colors focus-within:ring-2 focus-within:ring-ring",
        unread ? "border-foreground/10 bg-card shadow-sm" : "bg-card/60 hover:bg-card"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg",
          unread ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        {/* The whole card is one click target; the mark-read button sits above it. */}
        <button
          type="button"
          onClick={onSelect}
          className="block text-left outline-none after:absolute after:inset-0 after:rounded-xl after:content-['']"
        >
          <span className="flex items-start gap-2">
            <span className={cn("line-clamp-2 text-sm leading-5", unread ? "font-semibold" : "font-medium text-foreground/80")}>
              {item.title}
            </span>
            {unread ? (
              <>
                <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                <span className="sr-only">Unread</span>
              </>
            ) : null}
          </span>
          {item.body ? <span className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.body}</span> : null}
        </button>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <time dateTime={item.createdAt} className="tabular-nums">
            {formatRelativeTime(item.createdAt)}
          </time>
          {action ? (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-0.5 font-medium text-foreground group-hover:underline">
                {action}
                <ArrowRight className="size-3" />
              </span>
            </>
          ) : null}
        </div>
      </div>

      {unread ? (
        <button
          type="button"
          onClick={() => void markNotificationRead(item.id)}
          aria-label="Mark as read"
          title="Mark as read"
          className="relative z-10 grid size-8 shrink-0 place-items-center self-start rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Check className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <span aria-hidden className="grid size-12 place-items-center rounded-full border bg-card text-muted-foreground shadow-sm">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-64 text-sm leading-6 text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

function LoadingCards() {
  return (
    <div aria-busy="true" aria-label="Loading notifications" className="space-y-2">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex gap-3 rounded-xl border bg-card p-3.5">
          <span className="size-9 shrink-0 animate-pulse rounded-lg bg-muted" />
          <span className="flex-1 space-y-2.5 pt-1">
            <span className="block h-3.5 w-1/2 animate-pulse rounded bg-muted" />
            <span className="block h-3 w-full animate-pulse rounded bg-muted" />
            <span className="block h-3 w-2/3 animate-pulse rounded bg-muted" />
          </span>
        </div>
      ))}
    </div>
  );
}
