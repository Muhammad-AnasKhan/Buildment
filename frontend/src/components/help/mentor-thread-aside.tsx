"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  MessagesSquare,
  Phone,
  Reply,
  Timer,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/use-help-chat";
import { ChatAvatar } from "./help-chat-ui";
import { helpOutlineButton } from "./help-styles";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** "under a minute", "12 min", "3 h 20 min", "2 days 4 h". */
function duration(ms: number) {
  const minutes = Math.max(0, Math.round(ms / 60_000));
  if (minutes < 1) return "under a minute";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const rest = minutes % 60;
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
  }
  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  const dayText = `${days} day${days === 1 ? "" : "s"}`;
  return restHours ? `${dayText} ${restHours} h` : dayText;
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** A clock that re-renders every 30 seconds, so "waiting 3 min" keeps itself up to date. */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/**
 * Every number here is worked out from this conversation's real messages — nothing is
 * hard-coded or estimated — so it stays correct as the learner and mentor keep writing.
 */
function conversationStats(
  messages: ChatMessage[],
  menteeId: string,
  viewerId: string,
) {
  const sent = messages.filter((message) => !message.clientState);
  const fromLearner = sent.filter((message) => message.authorId === menteeId);
  const fromYou = sent.filter((message) => message.authorId === viewerId);

  // Time between a learner message that was waiting and the reply that answered it.
  let waitingSince: number | null = null;
  const replyTimes: number[] = [];
  for (const message of sent) {
    const at = new Date(message.createdAt).getTime();
    if (message.authorId === menteeId) {
      if (waitingSince === null) waitingSince = at;
    } else if (waitingSince !== null) {
      replyTimes.push(at - waitingSince);
      waitingSince = null;
    }
  }

  return {
    total: sent.length,
    learnerCount: fromLearner.length,
    yourCount: fromYou.length,
    averageReplyMs: replyTimes.length
      ? replyTimes.reduce((sum, value) => sum + value, 0) / replyTimes.length
      : null,
    firstAt: sent[0]?.createdAt ?? null,
    lastAt: sent[sent.length - 1]?.createdAt ?? null,
    waitingSinceMs: waitingSince,
    lastFromYou: fromYou[fromYou.length - 1] ?? null,
  };
}

function StatTile({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof MessagesSquare;
  value: string | number;
  label: string;
  tone: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-3 shadow-sm transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between gap-2">
        <p
          suppressHydrationWarning
          className="truncate text-xl font-semibold leading-none tabular-nums text-foreground"
        >
          {value}
        </p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-xl",
            tone,
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="mt-2 text-xs leading-tight text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        suppressHydrationWarning
        className="mt-0.5 break-words text-sm font-medium leading-snug text-foreground"
      >
        {children}
      </dd>
    </div>
  );
}

/**
 * The mentor's side panel next to a conversation, in a single card with the same height as
 * the chat: who the learner is, whether they are waiting, live quick stats and the thread's
 * details. On tablets and phones it sits under the chat with the stats in one row.
 */
export function MentorThreadAside({
  menteeName,
  menteeEmail,
  menteeId,
  viewerId,
  courseTitle,
  lessonTitle,
  status,
  messages,
  className,
}: {
  menteeName: string;
  menteeEmail: string;
  menteeId: string;
  viewerId: string;
  courseTitle: string;
  lessonTitle: string | null;
  status: "OPEN" | "RESOLVED";
  messages: ChatMessage[];
  className?: string;
}) {
  const now = useNow();
  const stats = useMemo(
    () => conversationStats(messages, menteeId, viewerId),
    [messages, menteeId, viewerId],
  );

  const banner =
    status === "RESOLVED"
      ? {
          tone: "border-ok/30 bg-ok-soft text-ok",
          icon: CheckCircle2,
          title: "Resolved",
          text: "The learner can ask again from the lesson.",
        }
      : stats.waitingSinceMs !== null
        ? {
            tone: "border-brand-yellow/50 bg-brand-yellow/10 text-foreground",
            icon: Clock3,
            title: `Waiting ${duration(now - stats.waitingSinceMs)}`,
            text: "The learner is waiting for your reply.",
          }
        : {
            tone: "border-primary/20 bg-primary/5 text-foreground",
            icon: Reply,
            title: "You replied",
            text: stats.lastFromYou?.seenAt
              ? `Seen by the learner ${duration(now - new Date(stats.lastFromYou.seenAt).getTime())} ago.`
              : stats.lastFromYou?.deliveredAt
                ? "Delivered. The learner has not opened it yet."
                : "Sent. The learner is offline.",
          };
  const BannerIcon = banner.icon;

  const sinceLast = stats.lastAt
    ? now - new Date(stats.lastAt).getTime()
    : null;

  return (
    <aside
      aria-label="Learner details and quick stats"
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-md lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-5 py-4">
        <ChatAvatar
          label={initials(menteeName)}
          variant="soft"
          className="bg-card shadow-sm ring-2 ring-primary/15"
        />

        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
            {menteeName}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {menteeEmail}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "mx-4 mt-4 flex items-start gap-3 rounded-2xl border px-4 py-3",
          banner.tone,
        )}
        aria-live="polite"
      >
        <BannerIcon className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div className="min-w-0">
          <p suppressHydrationWarning className="text-sm font-semibold">
            {banner.title}
          </p>
          <p
            suppressHydrationWarning
            className="mt-0.5 text-xs leading-relaxed opacity-80"
          >
            {banner.text}
          </p>
        </div>
      </div>

      <section
        aria-label="Quick stats"
        className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-4 lg:grid-cols-2"
      >
        <StatTile
          icon={MessagesSquare}
          value={stats.total}
          label="Messages"
          tone="bg-primary/10 text-primary"
        />
        <StatTile
          icon={UserRound}
          value={stats.learnerCount}
          label="From learner"
          tone="bg-brand-yellow/20 text-foreground"
        />
        <StatTile
          icon={Reply}
          value={stats.yourCount}
          label="Your replies"
          tone="bg-ok-soft text-ok"
        />
        <StatTile
          icon={Timer}
          value={
            stats.averageReplyMs === null ? "—" : duration(stats.averageReplyMs)
          }
          label="Avg. reply time"
          tone="bg-muted text-foreground"
        />
      </section>

      <dl className="mx-4 mb-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-border bg-muted/30 p-4">
        <DetailRow label="Course" className="col-span-2">
          {courseTitle}
        </DetailRow>
        {lessonTitle && (
          <DetailRow label="Lesson" className="col-span-2">
            {lessonTitle}
          </DetailRow>
        )}

        {stats.firstAt && (
          <DetailRow label="Asked">{formatWhen(stats.firstAt)}</DetailRow>
        )}
        {sinceLast !== null && (
          <DetailRow label="Last activity">
            {sinceLast < 60_000 ? "Just now" : `${duration(sinceLast)} ago`}
          </DetailRow>
        )}
      </dl>

      <div className="mx-4 mb-4 mt-auto flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-card text-muted-foreground ring-1 ring-border">
            <Phone className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              Meet with mentee
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Calls are coming soon
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled
          className={`${helpOutlineButton} shrink-0 text-muted-foreground`}
        >
          Start call
        </button>
      </div>
    </aside>
  );
}
